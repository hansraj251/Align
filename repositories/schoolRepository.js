const db =
    require("../db");

exports.getById =
async (
    schoolId
) => {

    return await db.getAsync(
        `
        SELECT *
        FROM schools
        WHERE id = ?
        `,
        [
            schoolId
        ]
    );

};
