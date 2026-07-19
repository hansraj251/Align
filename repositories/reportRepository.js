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

    ps.payment_method,

    IFNULL(SUM(ps.amount),0) AS amount

FROM payment_splits ps

JOIN orders o

    ON o.id = ps.order_id

WHERE

    o.restaurant_id = ?

    AND o.status = 'paid'

    AND DATE(o.paid_at)
        BETWEEN DATE(?) AND DATE(?)

GROUP BY

    ps.payment_method

ORDER BY

    amount DESC
        `,
        [
            restaurantId,
            from,
            to
        ]
    );

};
