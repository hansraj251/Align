const db = require("../db");

exports.getAll = async () => {

    return await db.allAsync(
        `
        SELECT
            id,
            slug,
            display_name,
            description,
            status,
            created_at,
            updated_at
        FROM plans
        ORDER BY id
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
            status,
            created_at,
            updated_at
        FROM plans
        WHERE status = 'active'
        ORDER BY id
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
    status
) => {

    const result = await db.runAsync(
        `
        INSERT INTO plans (
            slug,
            display_name,
            description,
            status
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            slug,
            displayName,
            description,
            status
        ]
    );

    return result.lastID;

};

exports.update = async (
    id,
    displayName,
    description,
    status
) => {

    await db.runAsync(
        `
        UPDATE plans
SET
    display_name = ?,
    description = ?,
    status = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
        `,
        [
    displayName,
    description,
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