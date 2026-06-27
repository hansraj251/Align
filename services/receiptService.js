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

    const restaurantRepository =
    require("../repositories/restaurantRepository");

const settingsRepository =
    require("../repositories/settingsRepository");

const restaurant =
    await restaurantRepository.getRestaurantForReceipt(
        restaurantId
    );

const settings =
    await settingsRepository.getReceiptSettings(
        restaurantId
    );

return {

    success: true,

    restaurant,

    settings,

    order,

    items

};

};