const db = require("../../db");

async function createOrderItemsTable() {

    const sql = `
    CREATE TABLE IF NOT EXISTS order_items (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        order_id INTEGER NOT NULL,

        menu_item_id INTEGER,

        item_name TEXT NOT NULL,

        food_type TEXT,

        quantity INTEGER DEFAULT 1,

        unit_price REAL NOT NULL,

        total_price REAL NOT NULL,

        notes TEXT,

        status TEXT DEFAULT 'pending',

        quick_item_id INTEGER,

        is_quick_item INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (order_id)
            REFERENCES orders(id)

    )
`;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Order Items table ready"
        );

    } catch (err) {

        console.error(
            "❌ Order Items table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports = createOrderItemsTable;