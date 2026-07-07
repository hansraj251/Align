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
exports.createKitchenTicket = async (
    orderId,
    items
) => {console.log("Kitchen items:", JSON.stringify(items, null, 2));

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

exports.updateTicketStatus = async (
    ticketId,
    status
) => {

    const ticket =
        await kitchenRepository.getTicketById(
            ticketId
        );

    if (!ticket) {

        throw new Error(
            "Ticket not found"
        );

    }

    await kitchenRepository.updateTicketStatus(
    ticketId,
    status
);

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
    

    if (status === "ready") {

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

    await kitchenRepository.closeTicket(
        ticketId
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