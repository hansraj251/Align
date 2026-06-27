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