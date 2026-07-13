const staffSessionRepository =
    require("../repositories/staffSessionRepository");

exports.getActiveSessions = async (restaurantId) => {

    return await staffSessionRepository.getActiveSessions(
        restaurantId
    );

};

exports.forceLogout = async (sessionId) => {

    await staffSessionRepository.forceLogout(
        sessionId
    );

    return {
        success: true
    };

};