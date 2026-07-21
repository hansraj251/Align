const db = require("../../db");

async function createQuickItemsTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS quick_items (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            price REAL NOT NULL,

            active INTEGER DEFAULT 1,

            sort_order INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id)

        )
    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Quick Items table ready"
        );

    } catch (err) {

        console.error(
            "❌ Quick Items table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports = createQuickItemsTable;