const kitchenRepository =
    require("../repositories/kitchenRepository");
const menuRepository =
    require("../repositories/menuRepository");    
const orderRepository =
    require("../repositories/orderRepository");
const {
    generateNumber
} = require("../utils/numberGenerator");  
const variantRepository =
    require("../repositories/menuVariantRepository");  
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
    await kitchenRepository.updateOrderItemsStatus(

    ticket.order_id,

    status

);

    if (status === "served") {

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