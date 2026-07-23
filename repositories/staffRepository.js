const db = require("../db");

exports.createStaff = async (
    restaurantId,
    staffCode,
    name,
    mobile,
    username,
    password,
    role,
    salaryType,
    basicSalary,
    joiningDate,
    address,
    emergencyContact,
    status
) => {

    const result = await db.runAsync(
        `
        INSERT INTO staff
        (
            restaurant_id,
            staff_code,
            name,
            mobile,
            username,
            password,
            role,
            salary_type,
            basic_salary,
            joining_date,
            address,
            emergency_contact,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            restaurantId,
            staffCode,
            name,
            mobile,
            username,
            password,
            role,
            salaryType,
            basicSalary,
            joiningDate,
            address,
            emergencyContact,
            status
        ]
    );

    return result.lastID;

};

exports.getStaff = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT *

        FROM staff

        WHERE restaurant_id = ?

        ORDER BY name
        `,
        [restaurantId]
    );

};

exports.updateStaff = async (
    restaurantId,
    staffId,
    name,
    mobile,
    username,
    role,
    salaryType,
    basicSalary,
    joiningDate,
    address,
    emergencyContact,
    status
) => {

    const result = await db.runAsync(
        `
        UPDATE staff
        SET

            name=?,

            mobile=?,
            username=?,

            role=?,

            salary_type=?,

            basic_salary=?,

            joining_date=?,

            address=?,

            emergency_contact=?,

            status=?,

            updated_at=CURRENT_TIMESTAMP

        WHERE

            id=?

            AND restaurant_id=?
        `,
        [

            name,

            mobile,
            username,

            role,

            salaryType,

            basicSalary,

            joiningDate,

            address,

            emergencyContact,

            status,

            staffId,

            restaurantId

        ]
    );

    return result.changes;

};

exports.deleteStaff = async (
    restaurantId,
    staffId
) => {

    // Delete staff sessions first
    await db.runAsync(
        `
        DELETE FROM staff_sessions
        WHERE staff_id = ?
        `,
        [staffId]
    );

    // Delete staff
    const result = await db.runAsync(
        `
        DELETE
        FROM staff
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            staffId,
            restaurantId
        ]
    );

    return result.changes;

};

exports.getLastStaffCode = async () => {

    return await db.getAsync(
        `
        SELECT staff_code

        FROM staff

        ORDER BY id DESC

        LIMIT 1
        `
    );

};
exports.getByUsername = async (
    username
) => {

    return await db.getAsync(
        `
        SELECT

    s.id,

    s.restaurant_id,

    s.name,

    s.username,

    s.password,

    s.role,

    s.status,

    r.name AS restaurant_name

FROM staff s

JOIN restaurants r
ON r.id = s.restaurant_id

WHERE LOWER(s.username) = LOWER(?)

LIMIT 1
        `,
        [
            username
        ]
    );

};

exports.updateLastLogin = async (
    staffId
) => {

    await db.runAsync(
        `
        UPDATE staff

        SET

            last_login =
                CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
            staffId
        ]
    );

};
exports.usernameExists = async (
    username
) => {

    return await db.getAsync(
        `
        SELECT id
        FROM staff
        WHERE LOWER(username)=LOWER(?)
        `,
        [
            username
        ]
    );

};

exports.updatePassword = async (
    staffId,
    password
) => {

    await db.runAsync(
        `
        UPDATE staff

        SET

            password = ?,

            updated_at =
                CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
            password,
            staffId
        ]
    );

};

exports.saveFcmToken = async (
    staffId,
    fcmToken
) => {
    

    await db.runAsync(
        `
        UPDATE staff

        SET

            fcm_token = ?,

            updated_at =
                CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
            fcmToken,
            staffId
        ]
    );

};

exports.clearFcmToken = async (staffId) => {

    console.log(
        "[FCM CLEAR]",
        staffId
    );

    await db.runAsync(
        `
        UPDATE staff
        SET
            fcm_token = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [staffId]
    );

    const staff =
        await db.getAsync(
            `
            SELECT
                id,
                role,
                fcm_token
            FROM staff
            WHERE id = ?
            `,
            [staffId]
        );

    console.log(
        "[FCM AFTER CLEAR]",
        staff
    );

};

exports.getFcmToken = async (
    staffId
) => {

    return await db.getAsync(
        `
        SELECT
            fcm_token
        FROM staff
        WHERE id = ?
        `,
        [
            staffId
        ]
    );

};
exports.getFcmTokensByRole = async (
    restaurantId,
    role
) => {

    return await db.allAsync(
        `
        SELECT

            fcm_token

        FROM staff

        WHERE

            restaurant_id = ?

            AND role = ?

            AND status = 'active'

            AND fcm_token IS NOT NULL

            AND fcm_token != ''
        `,
        [
            restaurantId,
            role
        ]
    );

};

exports.clearFcmTokenByValue = async (
    fcmToken
) => {

    await db.runAsync(
        `
        UPDATE staff

        SET

            fcm_token = NULL,

            updated_at =
                CURRENT_TIMESTAMP

        WHERE fcm_token = ?
        `,
        [
            fcmToken
        ]
    );

};
exports.getStaffById = async (
    restaurantId,
    staffId
) => {

    return await db.getAsync(
        `
        SELECT
            id,
            status
        FROM
            staff
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            staffId,
            restaurantId
        ]
    );

};