const db = require("../../db");

async function createTablesTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS tables (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            capacity INTEGER DEFAULT 4,

            area_id INTEGER,

            display_row INTEGER DEFAULT 1,

            display_order INTEGER DEFAULT 1,

            system_key TEXT,

            status TEXT DEFAULT 'available',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id),

            FOREIGN KEY (area_id)
                REFERENCES dining_areas(id)

        )
    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Tables table ready"
        );

    } catch (err) {

        console.error(
            "❌ Tables table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports = createTablesTable;