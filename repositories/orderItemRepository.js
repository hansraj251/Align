const db = require("../db");

exports.updateStatus = async (
    restaurantId,
    orderItemId,
    status
) => {

    const result =
        await db.runAsync(
            `
            UPDATE order_items

            SET

                status = ?

            WHERE

                id = ?

                AND order_id IN (

                    SELECT id

                    FROM orders

                    WHERE restaurant_id = ?

                )
            `,
            [
                status,
                orderItemId,
                restaurantId
            ]
        );

    return result.changes;

};

exports.getByOrder = async (
    restaurantId,
    orderId
) => {

    return await db.allAsync(
        `
        SELECT

            oi.*

        FROM order_items oi

        JOIN orders o

            ON o.id = oi.order_id

        WHERE

            oi.order_id = ?

            AND o.restaurant_id = ?

        ORDER BY oi.id
        `,
        [
            orderId,
            restaurantId
        ]
    );

};
exports.getKitchenItems = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT

            oi.*,

            o.table_id

        FROM order_items oi

        JOIN orders o

            ON o.id = oi.order_id

        WHERE

            o.restaurant_id = ?

            AND oi.status IN
            (
                'pending',
                'preparing'
            )

        ORDER BY

            oi.created_at
        `,
        [
            restaurantId
        ]
    );

};

exports.getReadyItems = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT

            oi.*,

            o.table_id

        FROM order_items oi

        JOIN orders o

            ON o.id = oi.order_id

        WHERE

            o.restaurant_id = ?

            AND oi.status = 'ready'

        ORDER BY

            oi.created_at
        `,
        [
            restaurantId
        ]
    );

};
exports.getPendingItemsCount = async (
    orderId
) => {

    const row =
        await db.getAsync(
            `
            SELECT
                COUNT(*) AS total
            FROM order_items
            WHERE
                order_id = ?
                AND status != 'ready'
            `,
            [
                orderId
            ]
        );

    return row.total;

};
exports.getOrderIdByOrderItem = async (
    orderItemId
) => {

    return await db.getAsync(
        `
        SELECT
            order_id
        FROM order_items
        WHERE id = ?
        `,
        [
            orderItemId
        ]
    );

};