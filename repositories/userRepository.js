const db =
    require("../db");

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