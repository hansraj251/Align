const waiterRepository =
    require("../repositories/waiterRepository");

exports.getReadyItems = async (
    restaurantId,
    staffId,
    scope
) => {

    const orders =
        await waiterRepository.getReadyOrders(
            restaurantId,
            staffId,
            scope
        );

    for (const order of orders) {

        order.items =
            await waiterRepository.getReadyOrderItems(
                order.ticket_id
            );

    }

    return {

        success: true,

        orders

    };

};
exports.serveTicket = async (
    restaurantId,
    ticketId
) => {

    const ticket =
        await waiterRepository.getTicketById(
            ticketId,
            restaurantId
        );

    if (!ticket) {

        return {
            success: false,
            message: "Ticket not found"
        };

    }

    await waiterRepository.markTicketItemsServed(
        ticketId
    );

    await waiterRepository.markTicketServed(
        ticketId
    );

    const hasPendingItems =
        await waiterRepository.hasPendingKitchenItems(
            ticket.order_id
        );

    if (!hasPendingItems) {

        await waiterRepository.markOrderReadyForBilling(
            ticket.order_id
        );

    }

    return {
        success: true,
        message: "Items served successfully"
    };

};
exports.serveItem = async (
    restaurantId,
    itemId
) => {

    const ticket =
        await waiterRepository.getTicketByItemId(
            itemId,
            restaurantId
        );

    if (!ticket) {

        throw new Error(
            "Item not found."
        );

    }

    const updated =
        await waiterRepository.markItemServed(
            itemId
        );

    if (!updated) {

        throw new Error(
            "Item is already served."
        );

    }

    const hasReadyItems =
        await waiterRepository.hasReadyItemsInTicket(
            ticket.id
        );

    if (!hasReadyItems) {

        await waiterRepository.markTicketServed(
            ticket.id
        );

    }

    const hasPendingItems =
        await waiterRepository.hasPendingKitchenItems(
            ticket.order_id
        );

    if (!hasPendingItems) {

        await waiterRepository.markOrderReadyForBilling(
            ticket.order_id
        );

    }

    return {
        success: true,
        message: "Item served successfully"
    };

}