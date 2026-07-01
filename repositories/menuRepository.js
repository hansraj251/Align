const db = require("../db");

exports.getMenuItemById = async (
    id
) => {

    return await db.getAsync(
        `
        SELECT

            id,

            name,

            food_type,

            price,

            is_available

        FROM menu_items

        WHERE id = ?
        `,
        [id]
    );

};