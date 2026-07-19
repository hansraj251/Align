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
const planPricingRepository =
    require("../repositories/planPricingRepository");    
const dateUtils =
    require("../utils/date");    

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

const plans =
    await planRepository.getAll();

const highestPlan =
    plans.at(-1);

subscription.is_highest_plan =
    highestPlan
        ? highestPlan.id === subscription.plan_id
        : false;

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
    pricingId
) => {

    const pricing =
    await planPricingRepository
        .getById(
            pricingId
        );

if (!pricing) {

    throw new Error(
        "Pricing not found."
    );

}

if (
    pricing.status !== "active"
) {

    throw new Error(
        "Pricing is inactive."
    );

}

const plan =
    await planRepository
        .getById(
            pricing.plan_id
        );

if (!plan) {

    throw new Error(
        "Plan not found."
    );

}

if (
    plan.status !== "active"
) {

    throw new Error(
        "Plan is inactive."
    );

}

    if (
        Number(pricing.price) <= 0
    ) {

        throw new Error(
    "Invalid pricing amount."
);

    }
    const order =
    await razorpay.orders.create({

        amount:
            Math.round(
                Number(pricing.price) * 100
            ),

        currency:
            pricing.currency,

        receipt:
            `restaurant_${restaurantId}_${Date.now()}`,

        notes: {

            restaurantId:
                String(restaurantId),

            planId:
                String(plan.id)

        }

    });

await subscriptionOrderRepository.createOrder(
    restaurantId,
    plan.id,
    pricing.id,
    order.id,
    pricing.price,
    pricing.currency,
    pricing.duration_days
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

        await processSuccessfulPayment(

    order,

    razorpay_payment_id,

    null

);

        return {

            success: true,

            message:
                "Payment verified successfully."

        };

    };
exports.getPlans = async () => {

    const plans =
        await planRepository.getActive();

    const pricingList =
        await planPricingRepository.getAllActive();

    for (const plan of plans) {

        plan.pricing =
            pricingList.filter(
                pricing =>
                    pricing.plan_id === plan.id
            );

    }

    return plans;

};
exports.processWebhook =
    async (
        body,
        signature
    ) => {

        const expectedSignature =
            crypto
                .createHmac(

                    "sha256",

                    process.env
                        .RAZORPAY_WEBHOOK_SECRET

                )
                .update(body)
                .digest("hex");

        if (
            expectedSignature !==
            signature
        ) {

            throw new Error(
                "Invalid webhook signature."
            );

        }
        const payload =
            JSON.parse(
                body.toString()
            );
            if (
    payload.event !==
    "payment.captured"
) {

    return;

}
const payment =
    payload.payload
        .payment
        .entity;

const order =
    await subscriptionOrderRepository
        .getByRazorpayOrderId(
            payment.order_id
        );
if (!order) {

    console.warn(
        "Webhook received for unknown order:",
        payment.order_id
    );

    return;

}      
await processSuccessfulPayment(

    order,

    payment.id,

    payment.method

);          
        

    };  
async function processSuccessfulPayment(
    order,
    razorpayPaymentId,
    paymentMethod = null
) {

    if (
        order.status === "paid"
    ) {

        return;
    }

    await subscriptionOrderRepository
        .markPaid(

            order.razorpay_order_id,

            razorpayPaymentId,

            paymentMethod

        );

await exports.activateSubscription(
    order.restaurant_id,
    order.plan_pricing_id
);

}    

exports.activateSubscription = async (
    restaurantId,
    pricingId
) => {

    const pricing =
        await planPricingRepository
            .getById(
                pricingId
            );

    if (!pricing) {

        throw new Error(
            "Pricing not found."
        );

    }

    const subscription =
        await subscriptionRepository
            .getSubscription(
                restaurantId
            );

    const today =
        new Date();

        today.setHours(
    0,
    0,
    0,
    0
);

    let planStart;

    let renewalBase;

    let currentPlanEnd = null;

if (subscription.plan_end) {

    currentPlanEnd =
        new Date(
            subscription.plan_end
        );

    currentPlanEnd.setHours(
        0,
        0,
        0,
        0
    );

}
if (

    currentPlanEnd &&

    currentPlanEnd >= today &&

    (
        subscription.subscription_status === "active" ||
        subscription.subscription_status === "trial"
    )

) {

    const isUpgrade =
        subscription.plan_id !==
        pricing.plan_id;

    if (isUpgrade) {

        // Upgrade starts today

        planStart =
            new Date(today);

    } else if (
        subscription.plan_start
    ) {

        // Renewal keeps original start date

        planStart =
            new Date(
                subscription.plan_start
            );

        planStart.setHours(
            0,
            0,
            0,
            0
        );

    } else {

        planStart =
            new Date(today);

    }

    // Remaining validity is preserved
    renewalBase =
        currentPlanEnd;

} else {

    // Fresh Activation / Expired Renewal

    planStart =
        today;

    renewalBase =
        today;

}

    const planEnd =
        new Date(
            renewalBase
        );

    planEnd.setDate(

        planEnd.getDate() +

        Number(
            pricing.duration_days
        )

    );

    await subscriptionRepository
        .updateSubscription(

            restaurantId,

            pricing.plan_id,

           dateUtils.formatDate(
    planStart
),

           dateUtils.formatDate(
    planEnd
)

        );

};