const orderRepository =
    require("../repositories/orderRepository");

exports.getReceipt = async (
    restaurantId,
    orderId
) => {

    const order =
        await orderRepository.getReceipt(
            restaurantId,
            orderId
        );

    if (!order) {
        throw new Error("Order not found");
    }

    const items =
        await orderRepository.getReceiptItems(
            orderId
        );

return {

    success: true,

    order,

    items

};

};