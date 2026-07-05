const db = require("../db");

exports.createOrder = async (

    restaurantId,

    tableId,

    tableName,

    areaName

) => {

    const result = await db.runAsync(
        `
        INSERT INTO orders
(
    restaurant_id,
    table_id,
    table_name,
    area_name,
    status
)
VALUES (?, ?, ?, ?, ?)
        `,
        [
    restaurantId,
    tableId,
    tableName,
    areaName,
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
    itemName,
    foodType,
    variantId,
    variantName,
    quantity,
    unitPrice,
    totalPrice
) => {

    const result = await db.runAsync(
        `
        INSERT INTO order_items
        (
            order_id,
            menu_item_id,
            item_name,
            food_type,
            variant_id,
            variant_name,
            quantity,
            unit_price,
            total_price
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            orderId,
            menuItemId,
            itemName,
            itemName ? foodType : foodType,
            variantId,
            variantName,
            quantity,
            unitPrice,
            totalPrice
        ]
    );

    return result.lastID;

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
exports.getActiveOrderByTable = async (
    restaurantId,
    tableId
) => {

    const order =
        await db.getAsync(
            `
            SELECT *

            FROM orders

            WHERE

                restaurant_id = ?

                AND table_id = ?

                AND status IN (

                    'open',

                    'sent_to_kitchen',

                    'preparing',

                    'ready',

                    'ready_for_billing'

                )

            LIMIT 1
            `,
            [
                restaurantId,
                tableId
            ]
        );

    if (!order) {

        return null;

    }

    order.items =
    await db.allAsync(
        `
        SELECT

            oi.id,

            oi.menu_item_id,

            oi.item_name,

            oi.variant_name,

            oi.quantity,

            oi.unit_price,

            oi.total_price,

            oi.notes,

            (
    SELECT id
    FROM kitchen_ticket_items kti
    WHERE
        kti.order_item_id = oi.id
        AND kti.status = 'pending'
    LIMIT 1
) AS pending_ticket_item_id,

(
    SELECT id
    FROM kitchen_ticket_items kti
    WHERE
        kti.order_item_id = oi.id
        AND kti.status = 'ready'
    LIMIT 1
) AS ready_ticket_item_id,

(
    SELECT COUNT(*)
    FROM kitchen_ticket_items kti
    WHERE
        kti.order_item_id = oi.id
        AND kti.status = 'cancelled'
) AS cancelled_count,

(
    SELECT COUNT(*)
    FROM kitchen_ticket_items kti
    WHERE
        kti.order_item_id = oi.id
        AND kti.status = 'served'
) AS served_count,

            (
                SELECT COALESCE(SUM(quantity),0)
                FROM kitchen_ticket_items kti
                WHERE
                    kti.order_item_id = oi.id
                    AND kti.status = 'pending'
            ) AS pending_count,

            (
                SELECT COALESCE(SUM(quantity),0)
                FROM kitchen_ticket_items kti
                WHERE
                    kti.order_item_id = oi.id
                    AND kti.status = 'preparing'
            ) AS preparing_count,

            (
                SELECT COALESCE(SUM(quantity),0)
                FROM kitchen_ticket_items kti
                WHERE
                    kti.order_item_id = oi.id
                    AND kti.status = 'ready'
            ) AS ready_count

        FROM order_items oi

        WHERE
            oi.order_id = ?

        ORDER BY
            oi.id
        `,
        [
            order.id
        ]
    );

    return order;

};
exports.getOrderItem = async (

    orderId,

    menuItemId,

    variantId

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

AND variant_id = ?
        `,
        [

    orderId,

    menuItemId,

    variantId

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
exports.getOrderDetails = async (
    restaurantId,
    orderId
) => {

    return await db.getAsync(
        `
        SELECT
            id,
            table_id,
            status,
            subtotal,
            tax,
            discount,
            total
        FROM orders
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            orderId,
            restaurantId
        ]
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
    o.discount,(
    o.subtotal * o.discount / 100
) AS discountAmount,
    o.total,
    o.payment_method,
    o.paid_at,
    o.table_name,

    o.restaurant_name,
    o.restaurant_address,
    o.restaurant_phone,
    o.restaurant_email,
    o.restaurant_gst,
    o.restaurant_logo,
    o.receipt_footer,
    o.cgst,
    o.sgst

FROM orders o

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
exports.getOrderItems = async (
    orderId
) => {

    return await db.allAsync(
        `
        SELECT

            oi.id,

            oi.menu_item_id,

            oi.item_name AS name,

            oi.variant_name,

            oi.quantity,

            oi.unit_price,

            (
                SELECT COUNT(*)
                FROM kitchen_ticket_items kti
                WHERE
                    kti.order_item_id = oi.id
                    AND kti.status = 'pending'
            ) AS pending_count,

            (
                SELECT COUNT(*)
                FROM kitchen_ticket_items kti
                WHERE
                    kti.order_item_id = oi.id
                    AND kti.status = 'preparing'
            ) AS preparing_count,

            (
                SELECT COUNT(*)
                FROM kitchen_ticket_items kti
                WHERE
                    kti.order_item_id = oi.id
                    AND kti.status = 'ready'
            ) AS ready_count

        FROM order_items oi

        WHERE
            oi.order_id = ?

        ORDER BY
            oi.id
        `,
        [
            orderId
        ]
    );

};
exports.getReceiptItems = async (
    orderId
) => {

    return await db.allAsync(
        `
        SELECT

    oi.item_name,

    oi.variant_name,

    oi.quantity,

    oi.unit_price,

    oi.total_price

FROM order_items oi

WHERE
    oi.order_id = ?
    AND NOT EXISTS (

        SELECT 1

        FROM kitchen_ticket_items kti

        WHERE
            kti.order_item_id = oi.id
            AND kti.status = 'cancelled'

    )

ORDER BY oi.id
        `,
        [orderId]
    );

};
exports.updateOrderStatus = async (
    orderId,
    status
) => {

    await db.runAsync(
        `
        UPDATE orders
        SET
            status = ?
        WHERE id = ?
        `,
        [
            status,
            orderId
        ]
    );

};
exports.getLastOrderNumberForToday = async () => {

    const today = new Date();

    const date =
        `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    return await db.getAsync(
        `
        SELECT
            order_number
        FROM orders
        WHERE
            order_number LIKE ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [
            `ORD-${date}-%`
        ]
    );

};

exports.getOrderHistory = async (
    restaurantId,
    fromDate,
    toDate
) => {

    let query = `
        SELECT

            id,
            order_number,
            table_name,
            total,
            payment_method,
            status,
            paid_at

        FROM orders

        WHERE

            restaurant_id = ?
            AND status = 'paid'
    `;

    const params = [
        restaurantId
    ];

    if (fromDate && toDate) {

        query += `
            AND DATE(paid_at)
            BETWEEN DATE(?) AND DATE(?)
        `;

        params.push(
            fromDate,
            toDate
        );

    }

    query += `
        ORDER BY paid_at DESC
    `;

    return await db.allAsync(
        query,
        params
    );

};
exports.saveReceiptSnapshot = async (
    orderId,
    snapshot
) => {

    await db.runAsync(
        `
        UPDATE orders
        SET

            restaurant_name = ?,

            restaurant_address = ?,

            restaurant_phone = ?,

            restaurant_email = ?,

            restaurant_gst = ?,

            restaurant_logo = ?,

            receipt_footer = ?,

            cgst = ?,

            sgst = ?

        WHERE id = ?
        `,
        [

            snapshot.restaurant_name,

            snapshot.restaurant_address,

            snapshot.restaurant_phone,

            snapshot.restaurant_email,

            snapshot.restaurant_gst,

            snapshot.restaurant_logo,

            snapshot.receipt_footer,

            snapshot.cgst,

            snapshot.sgst,

            orderId

        ]
    );

};

exports.updateDiscount = async (
    orderId,
    discount
) => {

    await db.runAsync(
        `
        UPDATE orders
        SET
            discount = ?
        WHERE id = ?
        `,
        [
            discount,
            orderId
        ]
    );

};
exports.updateOrderTotals = async (
    orderId,
    totals
) => {

    await db.runAsync(
        `
        UPDATE orders
        SET
            subtotal = ?,
            tax = ?,
            total = ?
        WHERE id = ?
        `,
        [
            totals.subtotal,
            totals.tax,
            totals.total,
            orderId
        ]
    );

};