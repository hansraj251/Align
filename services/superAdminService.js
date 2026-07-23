const superAdminRepository =
    require("../repositories/superAdminRepository");
const staffSessionRepository =
    require("../repositories/staffSessionRepository"); 
const planRepository =
    require("../repositories/planRepository");    
const staffSessionAdminService =
    require("./staffSessionAdminService");       

exports.getDashboardStats =
async () => {

    return await
        superAdminRepository
            .getDashboardStats();

};

exports.getRestaurants =
async () => {

    const restaurants =
        await superAdminRepository
            .getRestaurants();

    for (const restaurant of restaurants) {

        restaurant.active_devices =
            await staffSessionRepository
                .countActiveSessions(
                    restaurant.id
                );

    }

    return restaurants;

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


    return await
        staffSessionAdminService
            .forceLogout(
                sessionId
            );

};

exports.getRestaurantById =
async (restaurantId) => {

    const restaurant =
        await superAdminRepository
            .getRestaurantById(
                restaurantId
            );

    if (!restaurant) {

        return null;

    }

    restaurant.active_devices =
        await staffSessionRepository
            .countActiveSessions(
                restaurant.id
            );

    return restaurant;

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