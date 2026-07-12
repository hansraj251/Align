const db = require("../db");

exports.getAll = async (restaurantId) => {

    return await db.allAsync(
        `
        SELECT

    da.id,

    da.name,

    da.system_key,

    da.display_order,

    da.card_color,

    COUNT(t.id) AS total_tables,

            SUM(
                CASE
                    WHEN t.status = 'occupied'
                    THEN 1
                    ELSE 0
                END
            ) AS occupied_tables,

            COUNT(t.id)
-
SUM(
    CASE
        WHEN t.status = 'occupied'
        THEN 1
        ELSE 0
    END
)
AS available_tables

        FROM dining_areas da

        LEFT JOIN tables t

            ON t.area_id = da.id

        WHERE

    da.restaurant_id = ?

        GROUP BY
            da.id,
            da.name,
            da.system_key,
            da.display_order

        ORDER BY
            da.display_order,
            da.id
        `,
        [restaurantId]
    );

};

exports.getByName = async (
    restaurantId,
    name
) => {

    return await db.getAsync(
        `
        SELECT
            id
        FROM dining_areas
        WHERE
            restaurant_id = ?
            AND LOWER(name) = LOWER(?)
        `,
        [
            restaurantId,
            name
        ]
    );

};

exports.create = async (
    restaurantId,
    name
) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO dining_areas
            (
                restaurant_id,
                name
            )
            VALUES (?, ?)
            `,
            [
                restaurantId,
                name
            ]
        );

    return result.lastID;

};

exports.update = async (

    areaId,

    restaurantId,

    name,

    cardColor

) => {

    await db.runAsync(
        `
        UPDATE dining_areas
SET

    name = ?,

    card_color = ?,

    updated_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
    name,

    cardColor,

    areaId,

    restaurantId
]
    );

};

exports.getTableCount = async (
    areaId
) => {

    const row =
        await db.getAsync(
            `
            SELECT
                COUNT(*) AS total
            FROM tables
            WHERE area_id = ?
            `,
            [areaId]
        );

    return row.total;

};

exports.remove = async (
    areaId,
    restaurantId
) => {

    await db.runAsync(
        `
        DELETE FROM dining_areas
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            areaId,
            restaurantId
        ]
    );

};
exports.getById = async (
    restaurantId,
    areaId
) => {

    return await db.getAsync(
        `
        SELECT
            id,
            name,
            card_color
        FROM dining_areas
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            areaId,
            restaurantId
        ]
    );

};
exports.getByNameExcludingId = async (
    restaurantId,
    areaId,
    name
) => {

    return await db.getAsync(
        `
        SELECT
            id
        FROM dining_areas
        WHERE
            restaurant_id = ?
            AND LOWER(name)=LOWER(?)
            AND id != ?
        `,
        [
            restaurantId,
            name,
            areaId
        ]
    );

};

exports.getTakeAwayArea =
async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT
            id
        FROM dining_areas
        WHERE
            restaurant_id = ?
            AND system_key = 'takeaway'
        LIMIT 1
        `,
        [restaurantId]
    );

};