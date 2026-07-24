const db = require("../db");

exports.updateStatus = async (
    tableId,
    status
) => {

    await db.runAsync(
        `
        UPDATE tables
        SET status = ?
        WHERE id = ?
        `,
        [
            status,
            tableId
        ]
    );

};


exports.getByName = async (
    restaurantId,
    name
) => {

    return await db.getAsync(
        `
        SELECT id
        FROM tables
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

    tableId
) => {

    return await db.getAsync(
        `
        SELECT

            id

        FROM tables

        WHERE

            restaurant_id = ?

            AND name = ?

            AND id != ?
        `,
        [
            restaurantId,
            name,
            tableId
        ]
    );

};

exports.create = async (
    restaurantId,
    name,
    capacity,
    areaId = null
) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO tables
            (
                restaurant_id,
                name,
                capacity,
                area_id
            )
            VALUES (?,?,?,?)
            `,
            [
                restaurantId,
                name,
                capacity,
                areaId
            ]
        );

    return result.lastID;

};

exports.getAll = async (restaurantId) => {

    return await db.allAsync(
        `
        SELECT

            t.id,
            t.name,
            t.capacity,
            t.status,
            t.is_reserved,
            t.reserved_name,
            t.area_id,
             t.system_key,
            t.display_row,
            t.display_order,
            a.name AS area_name,

            o.id AS order_id,
            o.subtotal AS total,

            COALESCE(
                SUM(oi.quantity),
                0
            ) AS total_items,

            CAST(
                (
                    strftime('%s','now') -
                    strftime('%s', o.created_at)
                ) / 60
                AS INTEGER
            ) AS minutes

        FROM tables t

        LEFT JOIN dining_areas a
            ON a.id = t.area_id

        LEFT JOIN orders o
            ON o.table_id = t.id
            AND o.status IN (
                'open',
                'sent_to_kitchen',
                'preparing',
                'ready'
            )

        LEFT JOIN order_items oi
    ON oi.order_id = o.id
    AND NOT EXISTS (

        SELECT 1

        FROM kitchen_ticket_items kti

        WHERE
            kti.order_item_id = oi.id
            AND kti.status = 'cancelled'

    )

       WHERE

    t.restaurant_id = ?

        GROUP BY
            t.id,  t.system_key

        ORDER BY

    t.area_id,

    t.display_row,

    t.display_order,

    t.name
        `,
        [restaurantId]
    );

};

exports.delete = async (
    restaurantId,
    tableId
) => {

    return await db.runAsync(
        `
        DELETE
        FROM tables
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            tableId,
            restaurantId
        ]
    );

};
exports.getById = async (
    restaurantId,
    tableId
) => {

    return await db.getAsync(
        `
        SELECT
    id,
    name,
    capacity,
    area_id,
    system_key,
    display_row,
    display_order,
    is_reserved,
    reserved_name
        FROM tables
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            tableId,
            restaurantId
        ]
    );

};
exports.update = async (

    restaurantId,

    tableId,

    name,

    capacity,

    areaId,

    displayRow
) => {

    return await db.runAsync(
        `
        UPDATE tables
SET

    name = ?,

    capacity = ?,

    area_id = ?,

    display_row = ?

        WHERE

            id = ?

            AND restaurant_id = ?
        `,
        [

    name,

    capacity,

    areaId,

    displayRow,

    tableId,

    restaurantId

]
    );

};
exports.getTableDetails = async (
    restaurantId,
    tableId
) => {

    return await db.getAsync(
        `
        SELECT

            t.id,

            t.name,

            t.status,

            t.is_reserved,

            t.reserved_name,

            a.name AS area_name

        FROM tables t

        LEFT JOIN dining_areas a
            ON a.id = t.area_id

        WHERE

            t.id = ?

            AND t.restaurant_id = ?

        `,
        [
            tableId,
            restaurantId
        ]
    );

};
exports.getTakeAwayTable = async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT

            id,
            area_id

        FROM tables

        WHERE

            restaurant_id = ?

            AND system_key = 'takeaway'

        LIMIT 1
        `,
        [restaurantId]
    );

};
exports.getAvailableTakeAwayCount =
async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT
            COUNT(*) AS total
        FROM tables
        WHERE
            restaurant_id = ?
            AND system_key = 'takeaway'
            AND status = 'available'
        `,
        [restaurantId]
    );

};
exports.getLastTakeAwayTable =
async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT
            name
        FROM tables
        WHERE
            restaurant_id = ?
            AND system_key = 'takeaway'
        ORDER BY id DESC
        LIMIT 1
        `,
        [restaurantId]
    );

};
exports.createTakeAwayTable =
async (
    restaurantId,
    areaId,
    name
) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO tables
            (
                restaurant_id,
                name,
                capacity,
                area_id,
                display_row,
                display_order,
                status,
                system_key
            )
            VALUES
            (?, ?, 1, ?, 1, 1, 'available', 'takeaway')
            `,
            [
                restaurantId,
                name,
                areaId
            ]
        );

    return result.lastID;

};
exports.reserveTable = async (
    restaurantId,
    tableId,
    reservedName
) => {

    await db.runAsync(
        `
        UPDATE tables
        SET
            is_reserved = 1,
            reserved_name = ?
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            reservedName,
            tableId,
            restaurantId
        ]
    );

};

exports.clearReservation = async (
    restaurantId,
    tableId
) => {

    await db.runAsync(
        `
        UPDATE tables
        SET
            is_reserved = 0,
            reserved_name = NULL
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            tableId,
            restaurantId
        ]
    );

};