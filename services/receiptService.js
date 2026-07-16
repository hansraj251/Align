const orderRepository =
    require("../repositories/orderRepository");

const paymentSplitRepository =
    require("../repositories/paymentSplitRepository");

exports.getReceipt = async (
    restaurantId,
    orderId
) =>
{
    const order =
        await orderRepository.getReceipt(
            restaurantId,
            orderId
        );

    if (!order)
    {
        throw new Error(
            "Order not found"
        );
    }

    const items =
        await orderRepository.getReceiptItems(
            orderId
        );

    const paymentSplits =
        await paymentSplitRepository.getByOrder(
            orderId
        );

    return {

        success: true,

        order,

        items,

        paymentSplits

    };
};