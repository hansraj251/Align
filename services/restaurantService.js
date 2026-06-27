const restaurantRepository =
    require("../repositories/restaurantRepository");

exports.getRestaurant = async (
    restaurantId
) => {

    const restaurant =
        await restaurantRepository.getRestaurant(
            restaurantId
        );

    if (!restaurant) {
        throw new Error("Restaurant not found");
    }

    return {
        success: true,
        restaurant
    };

};

exports.updateRestaurant = async (
    restaurantId,
    body
) => {

    await restaurantRepository.updateRestaurant(
        restaurantId,
        body
    );

    return {
        success: true,
        message: "Restaurant profile updated"
    };

};