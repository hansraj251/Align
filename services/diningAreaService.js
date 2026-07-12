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
    name,
    cardColor
) => {

name = (name || "").trim();

cardColor =
    cardColor || "blue";

if (!name) {
    throw new Error(
        "Dining area name is required"
    );
}

    await diningAreaRepository.update(

    areaId,

    restaurantId,

    name,

    cardColor

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

    const area =
        await diningAreaRepository.getById(
            restaurantId,
            areaId
        );

    if (!area) {

        throw new Error(
            "Dining area not found"
        );

    }

    if (
        area.system_key === "takeaway"
    ) {

        throw new Error(
            "Default Take Away area cannot be deleted."
        );

    }

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