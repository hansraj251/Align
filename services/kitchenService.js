const kitchenRepository =
    require("../repositories/kitchenRepository");
const menuRepository =
    require("../repositories/menuRepository");    
const orderRepository =
    require("../repositories/orderRepository");
const tableRepository =
    require("../repositories/tableRepository");    
const {
    generateNumber
} = require("../utils/numberGenerator");  
const variantRepository =
    require("../repositories/menuVariantRepository"); 
const orderCalculationService =
    require("./orderCalculationService");
const { getIO } = require("../utils/socket"); 
const orderParticipantRepository =
    require("../repositories/orderParticipantRepository");   

exports.createKitchenTicket = async (
    orderId,
    items
) => {

    const ticketId =
    await kitchenRepository.createTicket(
        orderId
    );

const lastKot =
    await kitchenRepository.getLastKotNumberForToday();

const ticketNumber =
    generateNumber(
        "KOT",
        lastKot?.ticket_number
    );

await kitchenRepository.updateTicketNumber(
    ticketId,
    ticketNumber
);

    for (const item of items) {

    const menu =
        await menuRepository.getMenuItemById(
            item.menu_item_id
        );

    if (!menu) {

        throw new Error(
            "Menu item not found"
        );

    }

    let variant = null;

if (item.variant_id) {

    variant =
        await variantRepository.getVariantById(
            item.variant_id
        );

    if (!variant) {

        throw new Error(
            "Invalid variant"
        );

    }

}

    await kitchenRepository.createTicketItem(

    ticketId,

    item.order_item_id,

    menu.id,

    menu.name,

    variant?.name || null,

    variant?.price || menu.price,

    item.quantity

);

}

    return {

        ticketId,

        ticketNumber

    };

};

exports.getKitchenTickets = async (
    restaurantId
) => {

    const tickets =
        await kitchenRepository.getActiveTickets(
            restaurantId
        );

    for (const ticket of tickets) {

        ticket.items =
            await kitchenRepository.getTicketItems(
                ticket.id
            );

    }

    return {

        success: true,

        tickets

    };

};

exports.getKitchenTicket = async (
    ticketId,
    restaurantId
) => {

    const ticket =
        await kitchenRepository.getTicketById(
            ticketId
        );

    if (
        !ticket ||
        ticket.restaurant_id !== restaurantId
    ) {

        throw new Error(
            "Kitchen ticket not found"
        );

    }

    ticket.items =
        await kitchenRepository.getTicketItems(
            ticket.id
        );

    return {

        success: true,

        ticket

    };

};

exports.updateTicketStatus = async (ticketId, status) => {

    const ticket =
        await kitchenRepository.getTicketById(ticketId);

    if (!ticket) {

        throw new Error("Ticket not found");

    }

    const io = getIO();

    // 1. Ticket status update
    await kitchenRepository.updateTicketStatus(
        ticketId,
        status
    );

    // 2. Saare items update
    if (status === "preparing") {

        await kitchenRepository.updateTicketItemsStatus(
            ticketId,
            "preparing"
        );

    }

    if (status === "ready") {

        await kitchenRepository.updateTicketItemsStatus(
            ticketId,
            "ready"
        );

       // Waiter notification
const participants =
    await orderParticipantRepository.getParticipantIds(
        ticket.order_id
    );

if (
    participants.length === 0 &&
    ticket.created_by_staff_id
) {

    participants.push(
        ticket.created_by_staff_id
    );

}

for (const staffId of participants) {

    io.to(
        `staff_${staffId}`
    ).emit(
        "ticket-ready",
        {
            orderId: ticket.order_id,
            ticketId: ticket.id,
            tableName: ticket.table_name,
            ticketNumber: ticket.ticket_number
        }
    );

}
    }

    if (status === "served") {

        await kitchenRepository.updateTicketItemsStatus(
            ticketId,
            "served"
        );

        const activeTickets =
            await kitchenRepository.getActiveTicketCountByOrder(
                ticket.order_id
            );

        if (activeTickets === 0) {

            await orderRepository.updateOrderStatus(
                ticket.order_id,
                "ready_for_billing"
            );

        }

    }

    // 3. SABSE LAST ME ADMIN KO UPDATE BHEJO
    io.to(`restaurant_${ticket.restaurant_id}`).emit(
        "order-updated",
        {
            orderId: ticket.order_id,
            ticketId: ticket.id,
            status
        }
    );

    return {
        success: true
    };

};

exports.updateTicketItemStatus = async (
    ticketItemId,
    status
) => {

    const item =
        await kitchenRepository.getTicketItem(
            ticketItemId
        );

    if (!item) {

        throw new Error(
            "Kitchen item not found"
        );

    }

    await kitchenRepository.updateTicketItemStatus(
        ticketItemId,
        status
    );

    const io = getIO();

// Admin pages ko har status change par update bhejo

io.to(`restaurant_${item.restaurant_id}`).emit(

    "order-updated",

    {

        orderId: item.order_id,

        ticketId: item.ticket_id,

        status

    }

);

    if (status === "ready") {

    const participants =
    await orderParticipantRepository.getParticipantIds(
        item.order_id
    );

if (
    participants.length === 0 &&
    item.created_by_staff_id
) {

    participants.push(
        item.created_by_staff_id
    );

}

for (const staffId of participants) {

    io.to(
        `staff_${staffId}`
    ).emit(
        "ticket-ready",
        {
            orderId: item.order_id,
            ticketId: item.ticket_id,
            tableName: item.table_name,
            ticketNumber: item.ticket_number
        }
    );

}

    const pending =
        await kitchenRepository.getPendingTicketItems(
            item.ticket_id
        );
        

    if (pending === 0) {
        

        await kitchenRepository.updateTicketStatus(
            item.ticket_id,
            "ready"
        );

    }

}

    if (status === "served") {

        const readyItems =
            await kitchenRepository.getReadyTicketItems(
                item.ticket_id
            );

        if (readyItems === 0) {

            await kitchenRepository.updateTicketStatus(
                item.ticket_id,
                "served"
            );

        }

    }

    return {

        success: true

    };

};
exports.cancelTicketItem = async (
    ticketItemId
) => {

    const item =
        await kitchenRepository.getTicketItem(
            ticketItemId
        );

    if (!item) {

        throw new Error(
            "Kitchen item not found"
        );

    }

    if (item.status !== "pending") {

        throw new Error(
            "Only pending items can be cancelled"
        );

    }

    await kitchenRepository.cancelTicketItem(
        ticketItemId
    );
    const ticket =

        await kitchenRepository.getTicketById(

            item.ticket_id

        );

    const totals =

        await orderCalculationService.calculateOrderTotals(

            ticket.order_id

        );

    await orderRepository.updateOrderTotals(

        ticket.order_id,

        totals

    );

    return {

        success: true

    };

};
exports.closeCancelledTicket = async (
    ticketId
) => {

    const ticket =
        await kitchenRepository.getTicketById(
            ticketId
        );

    if (!ticket) {

        throw new Error(
            "Kitchen ticket not found"
        );

    }

    
    await kitchenRepository.closeAllTicketsByOrder(
    ticket.order_id
);

    const activeTickets =
    await kitchenRepository.getActiveTicketCountByOrder(
        ticket.order_id
    );

if (activeTickets === 0) {

    await orderRepository.updateOrderStatus(
        ticket.order_id,
        "closed"
    );

    await tableRepository.updateStatus(
        ticket.table_id,
        "available"
    );

}

    return {

        success: true

    };

};
exports.adminCancelTicketItem = async (
    ticketItemId
) => {

    const item =
        await kitchenRepository.getTicketItem(
            ticketItemId
        );

    if (!item) {

        throw new Error(
            "Kitchen item not found"
        );

    }

    if (

        item.status === "served" ||

        item.status === "cancelled"

    ) {

        throw new Error(
            "Item cannot be cancelled"
        );

    }

    const changes =
    await kitchenRepository.adminCancelTicketItem(
        ticketItemId
    );

if (changes === 0) {

    throw new Error(
        "Item could not be cancelled"
    );

}

    const ticket =
        await kitchenRepository.getTicketById(
            item.ticket_id
        );

    const totals =
        await orderCalculationService.calculateOrderTotals(
            ticket.order_id
        );

    await orderRepository.updateOrderTotals(
        ticket.order_id,
        totals
    );

    return {

        success: true

    };

};