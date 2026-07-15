const db = require("../../db");

async function createSystemMenuItemsTable() {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS system_menu_items (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            category_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            slug TEXT NOT NULL UNIQUE,

            food_type TEXT,

            keywords TEXT,

            search_text TEXT,

            popularity INTEGER DEFAULT 0,

            status INTEGER DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(category_id)
                REFERENCES system_categories(id)

        )
    `);

    console.log(
        "✅ System Menu Items table ready"
    );

}

module.exports = createSystemMenuItemsTable;