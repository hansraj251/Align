const db = require("../db");

exports.getAll = async (restaurantId) => {

    return await db.allAsync(
        `
        SELECT
            id,
            name,
            display_order
        FROM dining_areas
        WHERE restaurant_id = ?
        ORDER BY
            display_order,
            id
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
    name
) => {

    await db.runAsync(
        `
        UPDATE dining_areas
        SET
            name = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            name,
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
            name
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
