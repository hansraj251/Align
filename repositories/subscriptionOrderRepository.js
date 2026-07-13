const db =
    require("../db");

exports.createOrder =
    async (

        restaurantId,

        planId,

        razorpayOrderId,

        amount,

        currency

    ) => {

        await db.runAsync(
            `
            INSERT INTO
                subscription_orders
            (

                restaurant_id,

                plan_id,

                razorpay_order_id,

                amount,

                currency

            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?
            )
            `,
            [

                restaurantId,

                planId,

                razorpayOrderId,

                amount,

                currency

            ]
        );

    };
    exports.getByRazorpayOrderId =
    async (razorpayOrderId) => {

        return await db.getAsync(
            `
            SELECT *
            FROM subscription_orders
            WHERE razorpay_order_id = ?
            `,
            [
                razorpayOrderId
            ]
        );

    };
exports.markPaid =
    async (
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod = null
    ) => {

        await db.runAsync(
            `
            UPDATE subscription_orders
            SET

                status = 'paid',

                razorpay_payment_id = ?,

                payment_method = ?,

                paid_at = CURRENT_TIMESTAMP

            WHERE razorpay_order_id = ?
            `,
            [
                razorpayPaymentId,
                paymentMethod,
                razorpayOrderId
            ]
        );

    };

exports.getByRazorpayOrderId =
    async (
        razorpayOrderId
    ) => {

        return await db.getAsync(
            `
            SELECT *
            FROM subscription_orders
            WHERE razorpay_order_id = ?
            `,
            [
                razorpayOrderId
            ]
        );

    };    