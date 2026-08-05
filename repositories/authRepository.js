const db =
    require("../db");

exports.getByEmail =
async (
    email
) => {

    return await db.getAsync(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [
            email
        ]
    );

};

exports.getByEmailOrMobile =
async (
    email,
    mobile
) => {

    return await db.getAsync(
        `
        SELECT id
        FROM users
        WHERE
            email = ?
            OR mobile = ?
        `,
        [
            email,
            mobile
        ]
    );

};

exports.updatePassword =
async (
    email,
    passwordHash
) => {

    await db.runAsync(
        `
        UPDATE users

        SET

            password = ?

        WHERE
            email = ?
        `,
        [
            passwordHash,
            email
        ]
    );

};

exports.existsByEmail =
async (
    email
) => {

    return await db.getAsync(
        `
        SELECT id

        FROM users

        WHERE email = ?
        `,
        [
            email
        ]
    );

};