
const db =
    require("../db");

exports.getReadyOrders = async (
    restaurantId
) =>
{
    return await db.allAsync(
        `
        SELECT

            o.id,

            o.order_number,

            o.subtotal,

            o.discount,

            o.tax,

            o.total,

            o.created_at,

            o.area_name,

            t.name AS table_name

        FROM orders o

        JOIN tables t
            ON t.id = o.table_id

        WHERE
            o.restaurant_id = ?
            AND o.status = 'ready_for_billing'

        ORDER BY o.created_at
        `,
        [
            restaurantId
        ]
    );
};
exports.payOrder = async (
    restaurantId,
    orderId,
    discount,
    total,
    paymentMethod
) =>
{
    const db =
        require("../db");

    await db.run(
        `
        UPDATE orders
        SET

            discount = ?,

            total = ?,

            payment_method = ?,

            paid_at = CURRENT_TIMESTAMP,

            status = 'paid',

            updated_at = CURRENT_TIMESTAMP

        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            discount,
              total,
            paymentMethod,
            orderId,
            restaurantId
        ]
    );
};
