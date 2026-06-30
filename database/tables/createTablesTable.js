const db = require("../../db");

function createTablesTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS tables (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            capacity INTEGER DEFAULT 4,

            area_id INTEGER,

display_row INTEGER DEFAULT 1,

display_order INTEGER DEFAULT 1,

            status TEXT DEFAULT 'available',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
            REFERENCES restaurants(id)

        )
    `;

    db.run(sql, (err) => {

        if (err) {
            console.error(
                "❌ Tables table creation failed:",
                err.message
            );
        } else {
            console.log("✅ Tables table ready");
        }

    });

}

module.exports = createTablesTable;