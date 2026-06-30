const diningAreaRepository =
    require("../repositories/diningAreaRepository");

exports.getAll = async (
    restaurantId
) => {

    return await diningAreaRepository.getAll(
        restaurantId
    );

};

exports.create = async (
    restaurantId,
    name
) => {

    name = (name || "").trim();

    if (!name) {
        throw new Error(
            "Dining area name is required"
        );
    }

    const existing =
        await diningAreaRepository.getByName(
            restaurantId,
            name
        );

    if (existing) {
        throw new Error(
            "Dining area already exists"
        );
    }

    const areaId =
        await diningAreaRepository.create(
            restaurantId,
            name
        );

    return {

        success: true,

        message:
            "Dining area created successfully",

        areaId

    };

};

exports.update = async (
    restaurantId,
    areaId,
    name
) => {

    name = (name || "").trim();

    if (!name) {
        throw new Error(
            "Dining area name is required"
        );
    }

    await diningAreaRepository.update(

        areaId,

        restaurantId,

        name

    );

    return {

        success: true,

        message:
            "Dining area updated successfully"

    };

};

exports.remove = async (
    restaurantId,
    areaId
) => {

    const tableCount =
        await diningAreaRepository.getTableCount(
            areaId
        );

    if (tableCount > 0) {

        throw new Error(
            "Cannot delete dining area because it contains tables"
        );

    }

    await diningAreaRepository.remove(

        areaId,

        restaurantId

    );

    return {

        success: true,

        message:
            "Dining area deleted successfully"

    };

};