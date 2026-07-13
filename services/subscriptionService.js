const subscriptionRepository =
    require("../repositories/subscriptionRepository");

const planLimitRepository =
    require("../repositories/planLimitRepository");

const staffSessionRepository =
    require("../repositories/staffSessionRepository");

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