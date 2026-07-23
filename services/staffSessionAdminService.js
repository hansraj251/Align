const staffSessionRepository =
    require("../repositories/staffSessionRepository");
const staffSessionService =
    require("./staffSessionService");    

exports.getActiveSessions = async (restaurantId) => {

    return await staffSessionRepository.getActiveSessions(
        restaurantId
    );

};

exports.forceLogout = async (
    sessionId
) => {
console.log(
    "[STAFF SESSION ADMIN FORCE LOGOUT]",
    sessionId
);
    const session =
        await staffSessionRepository.getSessionById(
            sessionId
        );

    if (!session) {

        throw new Error(
            "Session not found."
        );

    }

    await staffSessionService.closeSession(
        sessionId,
        session.staff_id
    );

    return {
        success: true
    };

};