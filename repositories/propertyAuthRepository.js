const db = require("../db");

exports.getByEmail = async (
    email
) => {

    return await db.getAsync(
        `
        SELECT
            id,
            name,
            email,
            mobile,
            password,
            status,
            last_login,
            created_at
        FROM property_users
        WHERE email = ?
        `,
        [
            email
        ]
    );

};

exports.getByMobile = async (
    mobile
) => {

    return await db.getAsync(
        `
        SELECT
            id,
            name,
            email,
            mobile,
            password,
            status,
            last_login,
            created_at
        FROM property_users
        WHERE mobile = ?
        `,
        [
            mobile
        ]
    );

};

exports.updateLastLogin =
async (
    userId
) => {

    await db.runAsync(
        `
        UPDATE property_users
        SET
            last_login =
                CURRENT_TIMESTAMP,
            updated_at =
                CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [
            userId
        ]
    );

};

exports.getProfile = async (
    userId
) => {

    return await db.getAsync(
        `
        SELECT
            id,
            name,
            email,
            mobile,
            status,
            created_at,
            updated_at
        FROM property_users
        WHERE id = ?
        `,
        [
            userId
        ]
    );

};


exports.updateProfile = async (
    userId,
    name,
    email,
    mobile
) => {

    await db.runAsync(
        `
        UPDATE property_users
        SET
            name = ?,
            mobile = ?,
            updated_at =
                CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [
            name,
            mobile,
            userId
        ]
    );


    return await exports.getProfile(
        userId
    );

};
