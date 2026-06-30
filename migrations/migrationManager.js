const db = require("../db");

async function ensureMigrationTable() {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS schema_migrations (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            migration_name TEXT UNIQUE,

            executed_at DATETIME
                DEFAULT CURRENT_TIMESTAMP

        )
    `);

}

async function hasRun(name) {

    const row =
        await db.getAsync(
            `
            SELECT id
            FROM schema_migrations
            WHERE migration_name = ?
            `,
            [name]
        );

    return !!row;

}

async function markAsRun(name) {

    await db.runAsync(
        `
        INSERT INTO schema_migrations
        (
            migration_name
        )
        VALUES (?)
        `,
        [name]
    );

}

module.exports = {

    ensureMigrationTable,

    hasRun,

    markAsRun

};