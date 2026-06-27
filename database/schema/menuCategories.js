const db = require("../../db");

function createMenuCategoriesTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS menu_categories (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            slug TEXT NOT NULL,

            description TEXT,

            display_order INTEGER DEFAULT 0,

            status INTEGER DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
            REFERENCES restaurants(id)
        )
    `;

    db.run(sql, (err) => {

        if (err) {
            console.error("❌ Menu Categories table creation failed:", err.message);
        } else {
            console.log("✅ Menu Categories table ready");
        }

    });

}

module.exports = createMenuCategoriesTable;