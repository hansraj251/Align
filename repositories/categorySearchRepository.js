const db = require("../db");

exports.search = async (
    restaurantId,
    keyword
) => {

    return await db.allAsync(
        `
        SELECT
            id,
            name,
            slug,
            1 AS is_system
        FROM system_categories
        WHERE
            status = 1
            AND LOWER(name) LIKE LOWER(?)

        UNION

        SELECT
            id,
            name,
            slug,
            0 AS is_system
        FROM menu_categories
        WHERE
            restaurant_id = ?
            AND status = 1
            AND LOWER(name) LIKE LOWER(?)

        ORDER BY name
        `,
        [
            `%${keyword}%`,
            restaurantId,
            `%${keyword}%`
        ]
    );

};