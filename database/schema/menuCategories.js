const db = require("../../db");

async function createMenuCategoriesTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS menu_categories (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            slug TEXT NOT NULL,

            description TEXT,

            is_system INTEGER DEFAULT 0,

            system_category_id INTEGER,

            display_order INTEGER DEFAULT 0,

            status INTEGER DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(system_category_id)
    REFERENCES system_categories(id),

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id)    

        )
    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Menu Categories table ready"
        );

    } catch (err) {

        console.error(
            "❌ Menu Categories table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports = createMenuCategoriesTable;