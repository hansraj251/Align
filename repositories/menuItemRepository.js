const db = require("../db");

exports.createMenuItem = async (
    restaurantId,
    categoryId,
    name,
    price,
    foodType,
    description
) => {
const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
    const result = await db.runAsync(
        `
       INSERT INTO menu_items
(
    restaurant_id,
    category_id,
    name,
    slug,
    price,
    food_type,
    description
)
VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
    restaurantId,
    categoryId,
    name,
    slug,
    price,
    foodType,
    description || ""
]
    );

    return result.lastID;

};

exports.getMenuItems = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT

            mi.id,

            mi.category_id,

            mc.name AS category,

            mi.name,

            mi.price,

            mi.food_type,

            mi.description

        FROM menu_items mi

        JOIN menu_categories mc

            ON mc.id = mi.category_id

        WHERE

            mi.restaurant_id = ?

        ORDER BY

            mi.name
        `,
        [restaurantId]
    );

};

exports.updateMenuItem = async (
    restaurantId,
    itemId,
    categoryId,
    name,
    price,
    foodType,
    description
) => {

    const result = await db.runAsync(
        `
        UPDATE menu_items
        SET

            category_id = ?,

            name = ?,

             slug = ?,

            price = ?,

            food_type = ?,

            description = ?

        WHERE

            id = ?

            AND restaurant_id = ?
        `,
       [
    categoryId,
    name,
    slug,
    price,
    foodType,
    description || "",
    itemId,
    restaurantId
]
    );

    return result.changes;

};

exports.deleteMenuItem = async (
    restaurantId,
    itemId
) => {

    const result = await db.runAsync(
        `
        DELETE FROM menu_items
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            itemId,
            restaurantId
        ]
    );

    return result.changes;

};