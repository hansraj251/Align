const db = require("../db");

// Create new session
exports.createSession = async (session) => {

    const result = await db.runAsync(
    `
    INSERT INTO staff_sessions (

        restaurant_id,
        staff_id,
        role,
        device_info,
        ip_address

    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
        session.restaurant_id,
        session.staff_id,
        session.role,
        session.device_info || null,
        session.ip_address || null
    ]
);

    return result.lastID;

};



// Close one session
exports.closeSession = async (sessionId) => {

    await db.runAsync(
        `
        UPDATE staff_sessions
        SET

            is_active = 0,
            logout_at = CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [sessionId]
    );

};

// Close all active sessions of one staff
exports.closeStaffSessions = async (staffId) => {

    await db.runAsync(
        `
        UPDATE staff_sessions
        SET

            is_active = 0,
            logout_at = CURRENT_TIMESTAMP

        WHERE
            staff_id = ?
            AND is_active = 1
        `,
        [staffId]
    );

};

// Count active waiter/device sessions
exports.countActiveSessions = async (restaurantId) => {

    const row = await db.getAsync(
        `
        SELECT COUNT(*) AS total
FROM staff_sessions
WHERE

    restaurant_id = ?
    AND is_active = 1

    AND last_seen >= datetime(
        'now',
        '-5 minutes'
    )
        `,
        [restaurantId]
    );

    return row.total;

};

exports.cleanupInactiveSessions = async () => {

    await db.runAsync(
        `
        UPDATE staff_sessions
        SET

            is_active = 0,
            logout_at = CURRENT_TIMESTAMP

        WHERE
    is_active = 1
    AND logout_at IS NULL
    AND role IN (
        'waiter',
        'device'
    )
    AND last_seen < datetime(
        'now',
        '-5 minutes'
    )
        `
    );

};

// Active sessions list
exports.getActiveSessions = async (restaurantId) => {

    return await db.allAsync(
        `
        SELECT

    ss.id,

    ss.staff_id,

    s.name AS staff_name,

    ss.role,

    ss.login_at,

    ss.last_seen,

    ss.device_info,

    ss.ip_address

FROM staff_sessions ss

INNER JOIN staff s
    ON s.id = ss.staff_id

WHERE

    ss.restaurant_id = ?

    AND ss.is_active = 1

ORDER BY ss.login_at;
        `,
        [restaurantId]
    );

};

exports.getSessionById = async (sessionId) => {

    return await db.getAsync(
        `
        SELECT
    id,
    staff_id,
    restaurant_id,
    role,
    is_active,
    last_seen
FROM staff_sessions
WHERE id = ?
        `,
        [sessionId]
    );

};

exports.updateLastSeen = async (sessionId) => {

    await db.runAsync(
        `
        UPDATE staff_sessions
        SET
            last_seen = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND is_active = 1
            AND last_seen < datetime(
                'now',
                '-1 minute'
            )
        `,
        [sessionId]
    );

};

// Force logout
exports.forceLogout = async (sessionId) => {

    return await exports.closeSession(sessionId);

};
exports.getActiveSessionsByRestaurant = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT

            ss.id,
            ss.staff_id,
            ss.role,
            ss.device_info,
ss.ip_address,
            ss.login_at,
            ss.last_seen,

            s.name AS staff_name

        FROM
            staff_sessions ss

        INNER JOIN
            staff s

        ON
            s.id = ss.staff_id

        WHERE

            ss.restaurant_id = ?
            AND ss.is_active = 1

        ORDER BY

            ss.last_seen DESC
        `,
        [restaurantId]
    );

};
exports.logoutSession = async (sessionId) => {

    await db.runAsync(
        `
        UPDATE
            staff_sessions
        SET
            is_active = 0,
            logout_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
        `,
        [sessionId]
    );

};
exports.getSessionByRestaurant = async (
    sessionId,
    restaurantId
) => {

    return await db.getAsync(
        `
        SELECT
            *
        FROM
            staff_sessions
        WHERE
            id = ?
            AND restaurant_id = ?
            AND is_active = 1
        `,
        [
            sessionId,
            restaurantId
        ]
    );

};