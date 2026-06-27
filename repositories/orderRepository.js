const db = require("../db");

exports.createOrder = async (restaurantId, tableId) => {

    const result = await db.runAsync(
        `
        INSERT INTO orders
        (
            restaurant_id,
            table_id,
            status
        )
        VALUES (?, ?, ?)
        `,
        [
            restaurantId,
            tableId,
            "open"
        ]
    );

    return result.lastID;

};

exports.updateTotals = async (
    orderId,
    subtotal,
    tax,
    discount,
    total,
    status
) => {

    await db.runAsync(
        `
        UPDATE orders
        SET
            subtotal = ?,
            tax = ?,
            discount = ?,
            total = ?,
            status = ?
        WHERE id = ?
        `,
        [
            subtotal,
            tax,
            discount,
            total,
            status,
            orderId
        ]
    );

};

exports.addOrderItem = async (
    orderId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice
) => {

    await db.runAsync(
        `
        INSERT INTO order_items
        (
            order_id,
            menu_item_id,
            quantity,
            unit_price,
            total_price
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            orderId,
            menuItemId,
            quantity,
            unitPrice,
            totalPrice
        ]
    );

};
exports.updateOrderNumber = async (
    orderId,
    orderNumber
) => {

    await db.runAsync(
        `
        UPDATE orders
        SET order_number = ?
        WHERE id = ?
        `,
        [
            orderNumber,
            orderId
        ]
    );

};
exports.getActiveOrderByTable = (restaurantId, tableId) => {

    return db.getAsync(
        `
        SELECT
            id
        FROM orders
        WHERE
            restaurant_id = ?
            AND table_id = ?
            AND status IN (
                'open',
                'sent_to_kitchen',
                'preparing',
                'ready'
            )
        LIMIT 1
        `,
        [
            restaurantId,
            tableId
        ]
    );

};
exports.getOrderItem = async (
    orderId,
    menuItemId
) => {

    return await db.getAsync(
        `
        SELECT
            id,
            quantity
        FROM order_items
        WHERE
            order_id = ?
            AND menu_item_id = ?
        `,
        [
            orderId,
            menuItemId
        ]
    );

};
exports.updateOrderItem = async (
    orderItemId,
    quantity,
    totalPrice
) => {

    await db.runAsync(
        `
        UPDATE order_items
        SET
            quantity = ?,
            total_price = ?
        WHERE id = ?
        `,
        [
            quantity,
            totalPrice,
            orderItemId
        ]
    );

};
exports.getOrderSubtotal = async (
    orderId
) => {

    return await db.getAsync(
        `
        SELECT
            COALESCE(
                SUM(total_price),
                0
            ) AS subtotal
        FROM order_items
        WHERE order_id = ?
        `,
        [orderId]
    );

};
exports.getReceipt = async (restaurantId, orderId) => {

    return await db.getAsync(
        `
        SELECT
            o.id,
            o.order_number,
            o.subtotal,
            o.tax,
            o.discount,
            o.total,
            o.payment_method,
            o.paid_at,
            t.name AS table_name
        FROM orders o
        JOIN tables t
            ON t.id = o.table_id
        WHERE
            o.id = ?
            AND o.restaurant_id = ?
        `,
        [
            orderId,
            restaurantId
        ]
    );

};
exports.getReceiptItems = async (orderId) => {

    return await db.allAsync(
        `
        SELECT
            m.name,
            oi.quantity,
            oi.unit_price,
            oi.total_price
        FROM order_items oi
        JOIN menu_items m
            ON m.id = oi.menu_item_id
        WHERE oi.order_id = ?
        ORDER BY oi.id
        `,
        [orderId]
    );

};