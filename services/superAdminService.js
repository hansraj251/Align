const superAdminRepository =
    require("../repositories/superAdminRepository");
const staffSessionRepository =
    require("../repositories/staffSessionRepository"); 
const planRepository =
    require("../repositories/planRepository");    
       

exports.getDashboardStats =
async () => {

    return await
        superAdminRepository
            .getDashboardStats();

};

exports.getRestaurants =
async () => {

    return await
        superAdminRepository
            .getRestaurants();

};
exports.getActiveSessions =
async (restaurantId) => {

    return await
        staffSessionRepository
            .getActiveSessions(
                restaurantId
            );

};

exports.forceLogout =
async (sessionId) => {

    await
        staffSessionRepository
            .forceLogout(
                sessionId
            );

    return {
        success: true
    };

};

exports.getRestaurantById =
async (restaurantId) => {

    return await
        superAdminRepository
            .getRestaurantById(
                restaurantId
            );

};

exports.updateRestaurantSubscription =
async (

    restaurantId,

    planId,

    status

) => {

    if (!planId) {

        throw new Error(
            "Please select a plan."
        );

    }

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
        Number(plan.duration_days) < 1
    ) {

        throw new Error(
            "Invalid plan duration."
        );

    }

    await superAdminRepository
        .updateRestaurantSubscription(

            restaurantId,

            planId,

            status,

            plan.duration_days

        );

};