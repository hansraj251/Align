const subscriptionRequestRepository =
    require("../repositories/subscriptionRequestRepository");

const subscriptionRepository =
    require("../repositories/subscriptionRepository");

const planRepository =
    require("../repositories/planRepository");
const superAdminService =
    require("./superAdminService");    

exports.createUpgradeRequest =
    async (
        restaurantId,
        requestedPlanId
    ) =>
{

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

    const requestedPlan =
        await planRepository
            .getPlanById(
                requestedPlanId
            );

    if (!requestedPlan) {

        throw new Error(
            "Plan not found."
        );

    }

    if (
        requestedPlan.status !==
        "active"
    ) {

        throw new Error(
            "Selected plan is not available."
        );

    }

    if (
        subscription.plan_id ===
        requestedPlanId
    ) {

        throw new Error(
            "Restaurant is already using this plan."
        );

    }

    const pendingRequest =
        await subscriptionRequestRepository
            .getPendingRequestByRestaurantId(
                restaurantId
            );

    if (
        pendingRequest
    ) {

        throw new Error(
            "Upgrade request is already pending."
        );

    }

    const requestId =
        await subscriptionRequestRepository
            .createRequest(
                restaurantId,
                subscription.plan_id,
                requestedPlanId
            );

    return {

        message:
            "Upgrade request submitted successfully.",

        request_id:
            requestId

    };

};
exports.getAllRequests =
    async () =>
{

    return await subscriptionRequestRepository
        .getAllRequests();

};
exports.approveRequest =
    async (
        requestId,
        adminId,
        days
    ) =>
{

    const request =
        await subscriptionRequestRepository
            .getRequestById(
                requestId
            );

    if (!request) {

        throw new Error(
            "Upgrade request not found."
        );

    }

    if (
        request.status !==
        "pending"
    ) {

        throw new Error(
            "Upgrade request has already been processed."
        );

    }
    await superAdminService
    .updateRestaurantSubscription(

        request.restaurant_id,

        request.requested_plan_id,

        "active",

        days

    );

await subscriptionRequestRepository
    .approveRequest(

        requestId,

        adminId

    );

return {

    success: true,

    message:
        "Upgrade request approved successfully."

};

};