const db = require("../db");

exports.receivePayment = async (
    restaurantId,
    orderId,
    paymentMethod
) => {

    return await db.transaction(async () => {

        const order = await db.getAsync(
            `
            SELECT
                id,
                table_id,
                status
            FROM orders
            WHERE
                id = ?
                AND restaurant_id = ?
            `,
            [orderId, restaurantId]
        );

        if (!order) {
            throw new Error("Order not found");
        }

        if (order.status !== "ready") {
            throw new Error("Only ready orders can be paid");
        }

        await db.runAsync(
            `
            UPDATE orders
            SET
                status = 'paid',
                payment_method = ?,
                paid_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [
                paymentMethod,
                orderId
            ]
        );

        await db.runAsync(
            `
            UPDATE tables
            SET status = 'available'
            WHERE id = ?
            `,
            [order.table_id]
        );

        return {
            success: true,
            message: "Payment received"
        };

    });

};