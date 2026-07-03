const db = require("../db");

exports.createCategory = async (
    restaurantId,
    name,
    description
) => {

    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    const result = await db.runAsync(
        `
        INSERT INTO menu_categories
        (
            restaurant_id,
            name,
            slug,
            description
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            restaurantId,
            name,
            slug,
            description || ""
        ]
    );

    return result.lastID;

};

exports.getCategories = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT
            id,
            name,
            slug,
            description
        FROM menu_categories
        WHERE restaurant_id = ?
        ORDER BY name
        `,
        [restaurantId]
    );

};

exports.updateCategory = async (
    restaurantId,
    categoryId,
    name,
    description
) => {

    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    const result = await db.runAsync(
        `
        UPDATE menu_categories
        SET

            name = ?,

            slug = ?,

            description = ?

        WHERE

            id = ?

            AND restaurant_id = ?
        `,
        [
            name,
            slug,
            description || "",
            categoryId,
            restaurantId
        ]
    );

    return result.changes;

};

exports.deleteCategory = async (
    restaurantId,
    categoryId
) => {

    const result = await db.runAsync(
        `
        DELETE FROM menu_categories
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            categoryId,
            restaurantId
        ]
    );

    return result.changes;

};
exports.getSystemCategory = async (
    restaurantId,
    systemCategoryId
) => {

    return await db.getAsync(
        `
        SELECT
            id
        FROM menu_categories
        WHERE

            restaurant_id = ?

            AND system_category_id = ?
        `,
        [
            restaurantId,
            systemCategoryId
        ]
    );

};
exports.createSystemCategory = async (

    restaurantId,

    systemCategory

) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO menu_categories
            (

                restaurant_id,

                name,

                slug,

                is_system,

                system_category_id

            )

            VALUES

            (

                ?,

                ?,

                ?,

                1,

                ?

            )
            `,
            [

                restaurantId,

                systemCategory.name,

                systemCategory.slug,

                systemCategory.id

            ]
        );

    return result.lastID;

};
exports.getSystemCategory = async (

    restaurantId,

    systemCategoryId

) => {

    return await db.getAsync(
        `
        SELECT
            id
        FROM menu_categories
        WHERE

            restaurant_id = ?

            AND

            system_category_id = ?
        `,
        [

            restaurantId,

            systemCategoryId

        ]
    );

};
exports.createSystemCategory = async (

    restaurantId,

    systemCategory

) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO
            menu_categories
            (

                restaurant_id,

                name,

                slug,

                description,

                is_system,

                system_category_id

            )

            VALUES
            (

                ?,

                ?,

                ?,

                '',

                1,

                ?

            )
            `,
            [

                restaurantId,

                systemCategory.name,

                systemCategory.slug,

                systemCategory.id

            ]
        );

    return result.lastID;

};