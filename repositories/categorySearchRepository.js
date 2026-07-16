const db = require("../db");

exports.search = async (
    restaurantId,
    keyword
) => {

    return await db.allAsync(
        `
        SELECT
    sc.id,
    sc.name,
    sc.slug,
    1 AS is_system
FROM system_categories sc

WHERE
    sc.status = 1

    AND LOWER(sc.name) LIKE LOWER(?)

    AND NOT EXISTS
    (
        SELECT 1

        FROM menu_categories mc

        WHERE
            mc.restaurant_id = ?

            AND mc.status = 1

            AND LOWER(mc.name) =
                LOWER(sc.name)
    )

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

    restaurantId,
    `%${keyword}%`
]
    );

};