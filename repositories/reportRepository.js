const db = require("../db");

exports.getSalesSummary = async (
    restaurantId,
    from,
    to
) => {

    return await db.getAsync(
        `
        SELECT

            COUNT(*) AS total_orders,

            IFNULL(SUM(subtotal),0) AS gross_sales,

            IFNULL(SUM(discount),0) AS total_discount,

            IFNULL(SUM(tax),0) AS total_tax,

            IFNULL(SUM(total),0) AS net_sales,

            IFNULL(AVG(total),0) AS average_bill

        FROM orders

        WHERE
            restaurant_id = ?
            AND status = 'paid'
            AND DATE(paid_at)
                BETWEEN DATE(?) AND DATE(?)
        `,
        [
            restaurantId,
            from,
            to
        ]
    );

};

exports.getOrdersReport = async (
    restaurantId,
    from,
    to
) => {

    return await db.allAsync(
        `
        SELECT

            id,
            order_number,
            table_name,
            payment_method,
            subtotal,
            discount,
            tax,
            total,
            status,
            paid_at

        FROM orders

        WHERE

            restaurant_id = ?

            AND status = 'paid'

            AND DATE(paid_at)
                BETWEEN DATE(?) AND DATE(?)

        ORDER BY paid_at DESC
        `,
        [
            restaurantId,
            from,
            to
        ]
    );

};
exports.getItemsReport = async (
    restaurantId,
    from,
    to
) => {

    return await db.allAsync(
        `
        SELECT

    oi.menu_item_id,

    oi.item_name,

    SUM(oi.quantity) AS quantity,

    SUM(oi.total_price) AS sales

        FROM order_items oi

        JOIN orders o

            ON o.id = oi.order_id

        WHERE

            o.restaurant_id = ?

            AND o.status = 'paid'

            AND DATE(o.paid_at)
                BETWEEN DATE(?) AND DATE(?)

        GROUP BY

    oi.menu_item_id,

    oi.item_name

        ORDER BY sales DESC
        `,
        [
            restaurantId,
            from,
            to
        ]
    );

};
exports.getPaymentsReport = async (
    restaurantId,
    from,
    to
) => {

    return await db.allAsync(
        `
        SELECT

            payment_method,

            COUNT(*) AS total_orders,

            SUM(total) AS amount

        FROM orders

        WHERE

            restaurant_id = ?

            AND status = 'paid'

            AND DATE(paid_at)
                BETWEEN DATE(?) AND DATE(?)

        GROUP BY payment_method

        ORDER BY amount DESC
        `,
        [
            restaurantId,
            from,
            to
        ]
    );

};

exports.getAuditReport = async (
    restaurantId,
    from,
    to
) => {

    return await db.getAsync(
        `
        SELECT

            COUNT(*) AS total_orders,

            SUM(
                CASE
                    WHEN status='paid'
                    THEN 1
                    ELSE 0
                END
            ) AS paid_orders,

            SUM(
                CASE
                    WHEN status='cancelled'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_orders,

            SUM(
                CASE
                    WHEN status='ready_for_billing'
                    THEN 1
                    ELSE 0
                END
            ) AS billing_pending,

            SUM(
                CASE
                    WHEN status='sent_to_kitchen'
                    THEN 1
                    ELSE 0
                END
            ) AS kitchen_pending,

            SUM(
                CASE
                    WHEN status='open'
                    THEN 1
                    ELSE 0
                END
            ) AS open_orders

        FROM orders

        WHERE

            restaurant_id = ?

            AND DATE(created_at)
                BETWEEN DATE(?) AND DATE(?)

        `,
        [
            restaurantId,
            from,
            to
        ]
    );

};