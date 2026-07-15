const db = require("../db");

exports.getAll = async () => {

    return await db.allAsync(
        `
        SELECT
            id,
            slug,
            display_name,
            description,
            sort_order,
            status,
            created_at,
            updated_at
        FROM plans
        ORDER BY
        sort_order,
         id
        `
    );

};

exports.getActive = async () => {

    return await db.allAsync(
        `
        SELECT
            id,
            slug,
            display_name,
            description,
            sort_order,
            status,
            created_at,
            updated_at
        FROM plans
        WHERE status = 'active'
        ORDER BY 
        sort_order,
        id
        `
    );

};

exports.getById = async (id) => {

    return await db.getAsync(
        `
        SELECT
            id,
            slug,
            display_name,
            description,
            sort_order,
            status,
            created_at,
            updated_at
        FROM plans
        WHERE id = ?
        `,
        [id]
    );

};

exports.getBySlug = async (slug) => {

    return await db.getAsync(
        `
        SELECT
            id,
            slug,
            display_name,
            description,
            sort_order,
            status,
            created_at,
            updated_at
        FROM plans
        WHERE slug = ?
        `,
        [slug]
    );

};

exports.create = async (
    slug,
    displayName,
    description,
    sortOrder,
    status
) => {

    const result = await db.runAsync(
        `
        INSERT INTO plans (
            slug,
            display_name,
            description,
            sort_order,
            status
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            slug,
            displayName,
            description,
            sortOrder,
            status
        ]
    );

    return result.lastID;

};

exports.update = async (
    id,
    displayName,
    description,
    sortOrder,
    status
) => {

    await db.runAsync(
        `
        UPDATE plans
SET
    display_name = ?,
    description = ?,
    sort_order = ?,
    status = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
        `,
        [
    displayName,
    description,
    sortOrder,
    status,
    id
]
    );

};

exports.remove = async (id) => {

    await db.runAsync(
        `
        DELETE FROM plans
        WHERE id = ?
        `,
        [id]
    );

};