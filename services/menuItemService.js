const menuItemRepository =
    require("../repositories/menuItemRepository");

exports.createMenuItem = async (
    restaurantId,
    categoryId,
    name,
    price,
    foodType,
    description
) => {

    const itemId =
        await menuItemRepository.createMenuItem(
            restaurantId,
            categoryId,
            name,
            price,
            foodType,
            description
        );
        

    return {

        success: true,

        message:
            "Menu item created successfully",

        itemId

    };

};

exports.getMenuItems = async (
    restaurantId
) => {

    const items =
        await menuItemRepository.getMenuItems(
            restaurantId
        );

    return {

        success: true,

        items

    };

};

exports.updateMenuItem = async (
    restaurantId,
    itemId,
    categoryId,
    name,
    price,
    foodType,
    description
) => {

    const changes =
        await menuItemRepository.updateMenuItem(
            restaurantId,
            itemId,
            categoryId,
            name,
            price,
            foodType,
            description
        );

    if (!changes) {

        throw new Error(
            "Menu item not found"
        );

    }

    return {

        success: true,

        message:
            "Menu item updated successfully"

    };

};

exports.deleteMenuItem = async (
    restaurantId,
    itemId
) => {

    const changes =
        await menuItemRepository.deleteMenuItem(
            restaurantId,
            itemId
        );

    if (!changes) {

        throw new Error(
            "Menu item not found"
        );

    }

    return {

        success: true,

        message:
            "Menu item deleted successfully"

    };

};
exports.updateAvailability = async (
    restaurantId,
    itemId,
    isAvailable
) => {

    const changes =
        await menuItemRepository.updateAvailability(

            restaurantId,

            itemId,

            isAvailable

        );

    if (!changes) {

        throw new Error(
            "Menu item not found"
        );

    }

    return {

        success: true,

        message:
            "Availability updated successfully"

    };

};