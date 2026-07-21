const tableRepository =
    require("../repositories/tableRepository");
const diningAreaRepository =
    require("../repositories/diningAreaRepository");  
const orderRepository =
    require("../repositories/orderRepository");      

exports.getAll = async (
    restaurantId
) => {

    return await tableRepository.getAll(
        restaurantId
    );

};

exports.create = async (
    restaurantId,
    data
) => {

    const name =
        (data.name || "").trim();

    if (!name) {

        throw new Error(
            "Table name is required"
        );

    }

    const existing =
        await tableRepository.getByName(
            restaurantId,
            name
        );

    if (existing) {

        throw new Error(
            "Table name already exists"
        );

    }


if (data.area_id) {

    const area =
        await diningAreaRepository.getById(
            restaurantId,
            data.area_id
        );

    if (!area) {

        throw new Error(
            "Invalid dining area"
        );

    }

}
    const tableId =
        await tableRepository.create(

            restaurantId,

            name,

            data.capacity,

            data.area_id || null

        );

    return {

        success: true,

        message:
            "Table created successfully",

        tableId

    };

};

exports.delete = async (
    restaurantId,
    tableId
) => {
   const table =
    await tableRepository.getById(
        restaurantId,
        tableId
    );

if (table.system_key === "takeaway") {

    throw new Error(
        "Default Take Away table cannot be deleted."
    );

} 

    const activeOrders =
        await orderRepository.getActiveOrdersByTable(
            tableId,
            0
        );

    if (activeOrders > 0) {

        throw new Error(
            "Cannot delete table with an active order"
        );

    }

    const result =
        await tableRepository.delete(

            restaurantId,

            tableId

        );

    if (result.changes === 0) {

        throw new Error(
            "Table not found"
        );

    }

    return {

        success: true,

        message:
            "Table deleted successfully"

    };

};

exports.update = async (
    restaurantId,
    tableId,
    data
) => {

    const table =
        await tableRepository.getById(
            restaurantId,
            tableId
        );

    if (!table) {

        throw new Error(
            "Table not found"
        );

    }

    const name =
        (data.name || "").trim();
        

    if (!name) {

        throw new Error(
            "Table name is required"
        );

    }
    const existing =
    await tableRepository.getByNameExceptId(

        restaurantId,

        name,

        tableId

    );

if (existing) {

    throw new Error(
        "Table name already exists"
    );

}
    const capacity =
    Number(data.capacity);
    const displayRow =
    Number(data.display_row);

if (
    !Number.isInteger(displayRow) ||
    displayRow < 1
) {

    throw new Error(
        "Display Row must be at least 1"
    );

}

if (
    !Number.isInteger(capacity) ||
    capacity < 1
) {

    throw new Error(
        "Capacity must be at least 1"
    );

}

    if (data.area_id) {

        const area =
            await diningAreaRepository.getById(
                restaurantId,
                data.area_id
            );

        if (!area) {

            throw new Error(
                "Invalid dining area"
            );

        }

    }

    await tableRepository.update(

    restaurantId,

    tableId,

    name,

    data.capacity || 4,

    data.area_id || null,

   displayRow

);

    return {

        success: true,

        message:
            "Table updated successfully"

    };

};

exports.getTakeAwayTable = async (
    restaurantId
) => {

    return await tableRepository.getTakeAwayTable(
        restaurantId
    );

};