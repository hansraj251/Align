const db = require("../db");

exports.getCategories = (restaurantId) => {

    const db = require("../db");

exports.getCategories = async (restaurantId) => {

    return await db.allAsync(
        `
        SELECT
            id,
            name,
            slug,
            description,
            display_order,
            status
        FROM menu_categories
        WHERE restaurant_id = ?
        ORDER BY display_order, name
        `,
        [restaurantId]
    );

};

};