const db = require("../../db");

function createOrdersTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS orders (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            table_id INTEGER NOT NULL,

            order_number TEXT,

            status TEXT DEFAULT 'open',

            subtotal REAL DEFAULT 0,

            tax REAL DEFAULT 0,

            discount REAL DEFAULT 0,

            total REAL DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id),

            FOREIGN KEY (table_id)
                REFERENCES tables(id)

        )
    `;

    db.run(sql, err => {

        if (err) {
            console.error(
                "❌ Orders table creation failed:",
                err.message
            );
        } else {
            console.log("✅ Orders table ready");
        }

    });

}

module.exports = createOrdersTable;