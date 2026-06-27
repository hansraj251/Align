const db = require("../../db");

function createMenuItemsTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS menu_items (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            category_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            slug TEXT NOT NULL,

            description TEXT,

            price REAL NOT NULL,

            food_type TEXT DEFAULT 'veg',

            image TEXT,

            is_available INTEGER DEFAULT 1,

            display_order INTEGER DEFAULT 0,

            status INTEGER DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id),

            FOREIGN KEY (category_id)
                REFERENCES menu_categories(id)

        )
    `;

    db.run(sql, (err) => {

        if (err) {
            console.error("❌ Menu Items table creation failed:", err.message);
        } else {
            console.log("✅ Menu Items table ready");
        }

    });

}

module.exports = createMenuItemsTable;