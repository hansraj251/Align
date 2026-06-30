const db = require("../../db");

function createOrdersTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS orders (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            table_id INTEGER,

            order_number TEXT UNIQUE,

            table_name TEXT,

            area_name TEXT,

            status TEXT NOT NULL DEFAULT 'open',

            subtotal REAL NOT NULL DEFAULT 0,

            tax REAL NOT NULL DEFAULT 0,

            discount REAL NOT NULL DEFAULT 0,

            total REAL NOT NULL DEFAULT 0,

            payment_method TEXT,

            paid_at DATETIME,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id),

            FOREIGN KEY (table_id)
                REFERENCES tables(id)
                ON DELETE SET NULL

        )
    `;

    db.run(sql, err => {

        if (err) {

            console.error(
                "❌ Orders table creation failed:",
                err.message
            );

        } else {

            console.log(
                "✅ Orders table ready"
            );

        }

    });

}

module.exports = createOrdersTable;