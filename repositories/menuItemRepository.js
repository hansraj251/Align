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

    restaurantId,

    options

) => {

    const {

        page,

        limit,

        search

    } = options;

    const offset =
        (page - 1) * limit;

    const searchText =
        `%${search.toLowerCase()}%`;

    const totalRow =
        await db.getAsync(

            `
            SELECT

                COUNT(*) AS total

            FROM menu_items mi

            JOIN menu_categories mc

                ON mc.id = mi.category_id

            WHERE

                mi.restaurant_id = ?

                AND (

                    LOWER(mi.name) LIKE ?

                    OR LOWER(mc.name) LIKE ?

                )
            `,

            [

                restaurantId,

                searchText,

                searchText

            ]

        );

    const items =
        await db.allAsync(

            `
            SELECT

                mi.id,

                mi.category_id,

                mc.name AS category,

                mi.name,

                mi.price,

                mi.food_type,

                mi.description,

                mi.is_available

            FROM menu_items mi

            JOIN menu_categories mc

                ON mc.id = mi.category_id

            WHERE

                mi.restaurant_id = ?

                AND (

                    LOWER(mi.name) LIKE ?

                    OR LOWER(mc.name) LIKE ?

                )

            ORDER BY

                mi.name

            LIMIT ?

            OFFSET ?
            `,

            [

                restaurantId,

                searchText,

                searchText,

                limit,

                offset

            ]

        );

    return {

        items,

        page,

        limit,

        total:

            totalRow.total,

        totalPages:

            Math.ceil(
                totalRow.total / limit
            )

    };

};

exports.updateMenuItem = async (
    restaurantId,
    itemId,
    categoryId,
    name,
    price,
    foodType,
    description
) => {const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

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
exports.updateAvailability = async (
    restaurantId,
    itemId,
    isAvailable
) => {

    const result =
        await db.runAsync(

            `UPDATE menu_items
             SET
                 is_available = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE
                 id = ?
                 AND restaurant_id = ?`,

            [
                isAvailable,
                itemId,
                restaurantId
            ]

        );

    return result.changes;

};
exports.getVariantsByMenuItems = async (
    menuItemIds
) => {

    if (menuItemIds.length === 0) {

        return [];

    }

    const placeholders =
        menuItemIds
            .map(() => "?")
            .join(",");

    return await db.allAsync(
        `
        SELECT

            id,

            menu_item_id,

            name,

            price,

            display_order

        FROM menu_item_variants

        WHERE

            menu_item_id IN (${placeholders})

            AND status = 1

        ORDER BY

            menu_item_id,

            display_order,

            id
        `,
        menuItemIds
    );

};