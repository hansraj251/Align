const db = require("../db");

exports.getAll = async () => {

    return await db.allAsync(
        `
        SELECT
            *
        FROM system_categories
        WHERE status = 1
        ORDER BY name
        `
    );

};

exports.search = async (
    keyword
) => {

    return await db.allAsync(
        `
        SELECT
            *
        FROM system_categories
        WHERE

            status = 1

            AND

            LOWER(name)
            LIKE LOWER(?)

        ORDER BY name

        LIMIT 20
        `,
        [
            `%${keyword}%`
        ]
    );

};
exports.getById = async (
    id
) => {

    return await db.getAsync(
        `
        SELECT
            *
        FROM system_categories
        WHERE id = ?
        `,
        [id]
    );

};