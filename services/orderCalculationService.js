const db = require("../db");

exports.calculateOrderTotals = async (
    orderId
) => {

    const row =
        await db.getAsync(
            `
            SELECT

                COALESCE(
                    SUM(total_price),
                    0
                ) AS subtotal

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
            `,
            [
                orderId
            ]
        );

    const subtotal =
        Number(row.subtotal || 0);

    const order =
        await db.getAsync(
            `
            SELECT

                discount,

                cgst,

                sgst

            FROM orders

            WHERE id = ?
            `,
            [
                orderId
            ]
        );

    const discountPercent =
        Number(order.discount || 0);

    const cgst =
        Number(order.cgst || 0);

    const sgst =
        Number(order.sgst || 0);

    const discountAmount =
        subtotal *
        discountPercent /
        100;

    const taxable =
        subtotal -
        discountAmount;

    const tax =
        taxable *
        (cgst + sgst) /
        100;

    const total =
        taxable +
        tax;

    return {

    subtotal,

    discountPercent,

    discountAmount,

    tax,

    total

};

};