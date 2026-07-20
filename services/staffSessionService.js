const restaurantRepository =
    require("../repositories/restaurantRepository");

const planLimitRepository =
    require("../repositories/planLimitRepository");

const staffSessionRepository =
    require("../repositories/staffSessionRepository");
const staffRepository =
    require("../repositories/staffRepository");    

exports.canCreateWaiterSession = async (restaurantId) => {

    // Purane inactive sessions cleanup
    await staffSessionRepository.cleanupInactiveSessions();

    // Restaurant ka plan nikalo
    const restaurant =
        await restaurantRepository.getPlanDetails(
            restaurantId
        );

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    // Plan limit
    const limit =
        await planLimitRepository.getWaiterDeviceLimit(
            restaurant.plan_id
        );

    if (limit === null) {
        throw new Error("Order device limit not configured.");
    }

    // Unlimited
    if (limit === -1 || limit >= 999) {
        return true;
    }

    // Active sessions
    const activeSessions =
        await staffSessionRepository.countActiveSessions(
            restaurantId
        );

    return activeSessions < limit;

};

exports.createSession = async (sessionData) => {

    return await staffSessionRepository.createSession(
        sessionData
    );

};

exports.closeSession = async (
    sessionId,
    staffId
) => {

    if (staffId) {

        await staffRepository.clearFcmToken(
            staffId
        );

    }

    return await staffSessionRepository.closeSession(
        sessionId
    );

};

exports.getSessionById = async (sessionId) => {

    return await staffSessionRepository.getSessionById(
        sessionId
    );

};
exports.updateLastSeen = async (sessionId) => {

    return await staffSessionRepository.updateLastSeen(
        sessionId
    );

};
exports.getActiveSessionsByRestaurant = async (
    restaurantId
) => {

    return await staffSessionRepository.getActiveSessionsByRestaurant(
        restaurantId
    );

};
exports.logoutSession = async (
    sessionId,
    restaurantId
) => {

    const session =
        await staffSessionRepository.getSessionByRestaurant(
            sessionId,
            restaurantId
        );

    if (!session) {
        throw new Error(
            "Session not found."
        );
    }

    await staffSessionRepository.logoutSession(
        sessionId
    );

};