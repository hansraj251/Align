const db = require("../../db");

async function createDiningAreasTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS dining_areas (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            system_key TEXT,

            display_order INTEGER DEFAULT 0,
            card_color TEXT DEFAULT '#2563eb',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id)

        )
    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Dining Areas table ready"
        );

    } catch (err) {

        console.error(
            "❌ Dining Areas table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports = createDiningAreasTable;