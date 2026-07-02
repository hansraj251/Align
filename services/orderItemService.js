const repository =
    require("../repositories/orderItemRepository");    

const kitchenRepository =
    require("../repositories/kitchenRepository");

const orderRepository =
    require("../repositories/orderRepository");    

exports.updateStatus = async (
    restaurantId,
    orderItemId,
    status
) => {

    const changes =
        await repository.updateStatus(
            restaurantId,
            orderItemId,
            status
        );

    if (!changes) {

        throw new Error(
            "Order item not found"
        );

    }

    if (status === "ready") {

        const order =
            await repository.getOrderIdByOrderItem(
                orderItemId
            );

        const pending =
            await repository.getPendingItemsCount(
                order.order_id
            );

        if (pending === 0) {

            await kitchenRepository.updateTicketStatusByOrder(
                order.order_id,
                "ready"
            );

            await orderRepository.updateOrderStatus(
                order.order_id,
                "ready_for_billing"
            );

        }

    }

    return {

        success: true,

        message: "Status updated"

    };

};

exports.getItems = async (

    restaurantId,

    orderId

) => {

    const items =
        await repository.getByOrder(

            restaurantId,

            orderId

        );

    return {

        success: true,

        items

    };

};
exports.getKitchenItems =
async (restaurantId) => {

    const items =
        await repository.getKitchenItems(
            restaurantId
        );

    return {

        success: true,

        items

    };

};

exports.getReadyItems =
async (restaurantId) => {

    const items =
        await repository.getReadyItems(
            restaurantId
        );

    return {

        success: true,

        items

    };

};