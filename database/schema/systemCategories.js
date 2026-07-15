const db = require("../../db");

async function createSystemCategoriesTable() {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS system_categories (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            slug TEXT NOT NULL UNIQUE,

            status INTEGER DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);

    console.log(
        "✅ System Categories table ready"
    );

}

module.exports = createSystemCategoriesTable;