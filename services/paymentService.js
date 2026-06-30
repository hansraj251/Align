
const db = require("../db");
const restaurantRepository =
    require("../repositories/restaurantRepository");

const settingsRepository =
    require("../repositories/settingsRepository");

const orderRepository =
    require("../repositories/orderRepository");
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

        if (order.status !== "ready_for_billing") {
    throw new Error(
        "Only ready orders can be paid"
    );
}
const restaurant =
    await restaurantRepository.getRestaurantForReceipt(
        restaurantId
    );

const settings =
    await settingsRepository.getSettings(
        restaurantId
    );

await orderRepository.saveReceiptSnapshot(
    orderId,
    {

        restaurant_name:

    restaurant?.name || "",

restaurant_address:

    restaurant?.address || "",

restaurant_phone:

    restaurant?.mobile || "",

restaurant_email:

    restaurant?.email || "",

restaurant_gst:

    restaurant?.gst_number || "",

restaurant_logo:

    restaurant?.logo || "",

        receipt_footer:
    settings?.footer_message ||
    "Thank You! Visit Again.",

cgst:
    settings?.cgst ?? 2.5,

sgst:
    settings?.sgst ?? 2.5

    }
);
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
