const db = require("../db");

exports.create = async (

    restaurantId,

    name,

    price,

    active,

    sortOrder
) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO quick_items
            (
                restaurant_id,
                name,
                price,
                active,
                sort_order
            )
            VALUES
            (?, ?, ?, ?, ?)
            `,
            [
                restaurantId,
                name,
                price,
                active,
                sortOrder
            ]
        );

    return result.lastID;

};

exports.getAll = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT

            id,

            restaurant_id,

            name,

            price,

            active,

            sort_order,

            created_at,

            updated_at

        FROM quick_items

        WHERE
            restaurant_id = ?

        ORDER BY

            sort_order,

            name
        `,
        [restaurantId]
    );

};

exports.getById = async (

    restaurantId,

    quickItemId
) => {

    return await db.getAsync(
        `
        SELECT

            id,

            restaurant_id,

            name,

            price,

            active,

            sort_order,

            created_at,

            updated_at

        FROM quick_items

        WHERE

            id = ?

            AND restaurant_id = ?
        `,
        [
            quickItemId,
            restaurantId
        ]
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

        FROM quick_items

        WHERE

            restaurant_id = ?

            AND name = ?
        `,
        [
            restaurantId,
            name
        ]
    );

};

exports.getByNameExceptId = async (

    restaurantId,

    name,

    quickItemId
) => {

    return await db.getAsync(
        `
        SELECT

            id

        FROM quick_items

        WHERE

            restaurant_id = ?

            AND name = ?

            AND id != ?
        `,
        [
            restaurantId,
            name,
            quickItemId
        ]
    );

};

exports.update = async (

    restaurantId,

    quickItemId,

    name,

    price,

    active,

    sortOrder
) => {

    return await db.runAsync(
        `
        UPDATE quick_items

        SET

            name = ?,

            price = ?,

            active = ?,

            sort_order = ?,

            updated_at = CURRENT_TIMESTAMP

        WHERE

            id = ?

            AND restaurant_id = ?
        `,
        [
            name,
            price,
            active,
            sortOrder,
            quickItemId,
            restaurantId
        ]
    );

};

exports.delete = async (

    restaurantId,

    quickItemId
) => {

    return await db.runAsync(
        `
        DELETE

        FROM quick_items

        WHERE

            id = ?

            AND restaurant_id = ?
        `,
        [
            quickItemId,
            restaurantId
        ]
    );

};
exports.updateActive = async (

    restaurantId,

    quickItemId,

    active

) => {

    return await db.runAsync(

        `
        UPDATE quick_items

        SET

            active = ?,

            updated_at = CURRENT_TIMESTAMP

        WHERE

            restaurant_id = ?

            AND id = ?
        `,

        [

            active,

            restaurantId,

            quickItemId

        ]

    );

};