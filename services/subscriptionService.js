const subscriptionRepository =
    require("../repositories/subscriptionRepository");

const planLimitRepository =
    require("../repositories/planLimitRepository");

const staffSessionRepository =
    require("../repositories/staffSessionRepository");
const planRepository =
    require("../repositories/planRepository");

const razorpay =
    require("../config/razorpay");    
 
const crypto =
    require("crypto");

const subscriptionOrderRepository =
    require(
        "../repositories/subscriptionOrderRepository"
    );     

exports.getSubscription = async (
    restaurantId
) => {

    const subscription =
        await subscriptionRepository
            .getSubscription(
                restaurantId
            );

    if (!subscription) {

        throw new Error(
            "Subscription not found."
        );

    }

    subscription.allowed_devices =
        await planLimitRepository
            .getWaiterDeviceLimit(
                subscription.plan_id
            );

    subscription.active_devices =
        await staffSessionRepository
            .countActiveSessions(
                restaurantId
            );

    return subscription;

};

exports.validateRestaurant = async (
    restaurantId
) => {

    const subscription =
        await subscriptionRepository
            .getSubscription(
                restaurantId
            );

    if (!subscription) {

        throw new Error(
            "Subscription not found."
        );

    }

    // Auto Expire

    if (

        subscription.plan_end &&

        new Date(subscription.plan_end) <
        new Date() &&

        subscription.subscription_status !==
        "expired"

    ) {

        await subscriptionRepository
            .expireSubscription(
                restaurantId
            );

        subscription.subscription_status =
            "expired";

    }

    if (
        subscription.subscription_status ===
        "expired"
    ) {

        throw new Error(
            "Restaurant subscription has expired."
        );

    }

    if (
        subscription.subscription_status ===
        "suspended"
    ) {

        throw new Error(
            "Restaurant subscription is suspended."
        );

    }

    return subscription;

};
exports.createOrder = async (
    restaurantId,
    planId
) => {

    const plan =
        await planRepository
            .getPlanById(
                planId
            );

    if (!plan) {

        throw new Error(
            "Plan not found."
        );

    }

    if (
        plan.status !==
        "active"
    ) {

        throw new Error(
            "Plan is inactive."
        );

    }

    if (
        Number(plan.price) <= 0
    ) {

        throw new Error(
            "Invalid plan price."
        );

    }
    const order =
    await razorpay.orders.create({

        amount:
            Math.round(
                Number(plan.price) * 100
            ),

        currency:
            plan.currency,

        receipt:
            `restaurant_${restaurantId}_${Date.now()}`,

        notes: {

            restaurantId:
                String(restaurantId),

            planId:
                String(plan.id)

        }

    });

await subscriptionOrderRepository
    .createOrder(

        restaurantId,

        plan.id,

        order.id,

        plan.price,

        plan.currency

    );

return {

    key:
        process.env
            .RAZORPAY_KEY_ID,

    order

};

};
exports.verifyPayment =
    async (
        restaurantId,
        paymentData
    ) => {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature

        } = paymentData;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env
                        .RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");

        if (
            expectedSignature !==
            razorpay_signature
        ) {

            throw new Error(
                "Invalid payment signature."
            );

        }

        const order =
            await subscriptionOrderRepository
                .getByRazorpayOrderId(
                    razorpay_order_id
                );

        if (!order) {

            throw new Error(
                "Order not found."
            );

        }

        if (
            Number(order.restaurant_id) !==
            Number(restaurantId)
        ) {

            throw new Error(
                "Invalid restaurant."
            );

        }

        if (
            order.status === "paid"
        ) {

            return {

                success: true,

                message:
                    "Payment already processed."

            };

        }

        await subscriptionOrderRepository
            .markPaid(

                razorpay_order_id,

                razorpay_payment_id,

                null

            );

        await exports
            .activateSubscription(

                restaurantId,

                order.plan_id

            );

        return {

            success: true,

            message:
                "Payment verified successfully."

        };

    };
exports.getPlans =
    async () => {

        return await
            planRepository
                .getPlans();

    };    