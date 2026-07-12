const db = require("../db");

const tableRepository =
    require("../repositories/tableRepository");

const diningAreaRepository =
    require("../repositories/diningAreaRepository");

exports.ensureDefaultTakeAway = async (restaurantId) => {

    let area = await db.getAsync(
        `
        SELECT id
        FROM dining_areas
        WHERE
            restaurant_id = ?
            AND system_key = 'takeaway'
        `,
        [restaurantId]
    );

    if (!area) {

        const result = await db.runAsync(
            `
            INSERT INTO dining_areas
            (
                restaurant_id,
                name,
                system_key,
                display_order
            )
            VALUES
            (?, ?, ?, ?)
            `,
            [
                restaurantId,
                "Take Away",
                "takeaway",
                999
            ]
        );

        area = {
            id: result.lastID
        };

    }

    const table = await db.getAsync(
        `
        SELECT id
        FROM tables
        WHERE
            restaurant_id = ?
            AND system_key = 'takeaway'
        `,
        [restaurantId]
    );

    if (!table) {

        await db.runAsync(
            `
            INSERT INTO tables
            (
                restaurant_id,
                area_id,
                name,
                capacity,
                system_key,
                display_row,
                display_order,
                status
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                restaurantId,
                area.id,
                "Take Away",
                1,
                "takeaway",
                1,
                1,
                "available"
            ]
        );

    }

};

exports.ensureNextTakeAwayTable =
async (restaurantId) => {

    const available =
        await tableRepository.getAvailableTakeAwayCount(
            restaurantId
        );

    if (available.total > 0) {
        return;
    }

    const area =
        await diningAreaRepository.getTakeAwayArea(
            restaurantId
        );

    if (!area) {
        return;
    }

    const lastTable =
        await tableRepository.getLastTakeAwayTable(
            restaurantId
        );

    let nextNumber = 2;

if (lastTable) {

    if (lastTable.name === "Take Away") {

        nextNumber = 2;

    } else {

        const match =
            lastTable.name.match(/\d+$/);

        if (match) {

            nextNumber =
                Number(match[0]) + 1;

        }

    }

}

    await tableRepository.createTakeAwayTable(

        restaurantId,

        area.id,

        `Take Away ${nextNumber}`

    );

};