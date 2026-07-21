const quickItemRepository =
    require("../repositories/quickItemRepository");

exports.getAll = async (
    restaurantId
) => {

    return await quickItemRepository.getAll(
        restaurantId
    );

};

exports.create = async (
    restaurantId,
    data
) => {
    console.log({
        restaurantId,
        data
    });

    const name =
        (data.name || "").trim();

    if (!name) {

        throw new Error(
            "Quick item name is required"
        );

    }

    const price =
        Number(data.price);

    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        throw new Error(
            "Invalid price"
        );

    }

    const existing =
        await quickItemRepository.getByName(
            restaurantId,
            name
        );

    if (existing) {

        throw new Error(
            "Quick item already exists"
        );

    }

    const quickItemId =
        await quickItemRepository.create(

            restaurantId,

            name,

            price,

            data.active ?? 1,

            data.sort_order ?? 0

        );

    return {

        success: true,

        message:
            "Quick item created successfully",

        quickItemId

    };

};

exports.getById = async (
    restaurantId,
    quickItemId
) => {

    const quickItem =
        await quickItemRepository.getById(
            restaurantId,
            quickItemId
        );

    if (!quickItem) {

        throw new Error(
            "Quick item not found"
        );

    }

    return quickItem;

};

exports.update = async (
    restaurantId,
    quickItemId,
    data
) => {

    const quickItem =
        await quickItemRepository.getById(
            restaurantId,
            quickItemId
        );

    if (!quickItem) {

        throw new Error(
            "Quick item not found"
        );

    }

    const name =
        (data.name || "").trim();

    if (!name) {

        throw new Error(
            "Quick item name is required"
        );

    }

    const price =
        Number(data.price);

    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        throw new Error(
            "Invalid price"
        );

    }

    const duplicate =
        await quickItemRepository.getByNameExceptId(

            restaurantId,

            name,

            quickItemId

        );

    if (duplicate) {

        throw new Error(
            "Quick item already exists"
        );

    }

    await quickItemRepository.update(

        restaurantId,

        quickItemId,

        name,

        price,

        data.active ?? 1,

        data.sort_order ?? 0

    );

    return {

        success: true,

        message:
            "Quick item updated successfully"

    };

};

exports.delete = async (
    restaurantId,
    quickItemId
) => {

    const quickItem =
        await quickItemRepository.getById(
            restaurantId,
            quickItemId
        );

    if (!quickItem) {

        throw new Error(
            "Quick item not found"
        );

    }

    const result =
        await quickItemRepository.delete(

            restaurantId,

            quickItemId

        );

    if (result.changes === 0) {

        throw new Error(
            "Quick item not found"
        );

    }

    return {

        success: true,

        message:
            "Quick item deleted successfully"

    };

};
exports.updateActive = async (

    restaurantId,

    quickItemId,

    active

) => {

    const quickItem =
        await quickItemRepository.getById(

            restaurantId,

            quickItemId

        );

    if (!quickItem) {

        throw new Error(
            "Quick item not found"
        );

    }

    await quickItemRepository.updateActive(

        restaurantId,

        quickItemId,

        active ? 1 : 0

    );

    return {

        success: true,

        message:
            "Quick item updated successfully"

    };

};