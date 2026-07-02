const db = require("../db");

exports.getVariants = async (
    menuItemId
) => {

    return await db.allAsync(
        `
        SELECT

            id,

            name,

            price,

            display_order,

            status

        FROM menu_item_variants

        WHERE

            menu_item_id = ?

        ORDER BY

            display_order,

            id
        `,
        [menuItemId]
    );

};

exports.createVariant = async (
    menuItemId,
    name,
    price,
    displayOrder
) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO menu_item_variants
            (
                menu_item_id,
                name,
                price,
                display_order
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                menuItemId,
                name,
                price,
                displayOrder
            ]
        );

    return result.lastID;

};

exports.updateVariant = async (
    variantId,
    name,
    price,
    displayOrder
) => {

    const result =
        await db.runAsync(
            `
            UPDATE menu_item_variants

            SET

                name = ?,

                price = ?,

                display_order = ?,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = ?
            `,
            [
                name,
                price,
                displayOrder,
                variantId
            ]
        );

    return result.changes;

};

exports.deleteVariant = async (
    variantId
) => {

    const result =
        await db.runAsync(
            `
            DELETE FROM menu_item_variants
            WHERE id = ?
            `,
            [
                variantId
            ]
        );

    return result.changes;

};
exports.replaceVariants = async (
    menuItemId,
    variants
) => {

    return await db.transaction(async () => {

        await db.runAsync(
            `
            DELETE FROM menu_item_variants
            WHERE menu_item_id = ?
            `,
            [menuItemId]
        );

        for (let i = 0; i < variants.length; i++) {

            const item = variants[i];

            await db.runAsync(
                `
                INSERT INTO menu_item_variants
                (
                    menu_item_id,
                    name,
                    price,
                    display_order
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    menuItemId,
                    item.name,
                    item.price,
                    i + 1
                ]
            );

        }

    });

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

            display_order,

            status

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
exports.getVariantById = async (
    variantId
) => {

    return await db.getAsync(
        `
        SELECT

            id,

            menu_item_id,

            name,

            price

        FROM menu_item_variants

        WHERE id = ?
        `,
        [variantId]
    );

};