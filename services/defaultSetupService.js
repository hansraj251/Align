const db = require("../db");

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