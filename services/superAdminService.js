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

    status,

    days

) => {

    if (!planId) {

        throw new Error(
            "Please select a plan."
        );

    }

    const plan =
    await planRepository
        .getById(
            planId
        );

    if (!plan) {

        throw new Error(
            "Plan not found."
        );

    }

   if (
    Number(days) < 1
) {

    throw new Error(
        "Validity days must be greater than zero."
    );

} 

    await superAdminRepository
        .updateRestaurantSubscription(

            restaurantId,

            planId,

            status,

            Number(days)

        );

};