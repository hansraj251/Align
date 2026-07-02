const repository =
    require("../repositories/orderItemRepository");

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

    return {

        success: true,

        message:
            "Status updated"

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