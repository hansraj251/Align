const db = require("../../db");

function createUsersTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER,

            name TEXT NOT NULL,

            email TEXT UNIQUE,

            mobile TEXT UNIQUE,

            password TEXT NOT NULL,

            role TEXT NOT NULL DEFAULT 'owner',

            status TEXT NOT NULL DEFAULT 'active',

            last_login DATETIME,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id)
        );
    `;

    db.run(sql, (err) => {
        if (err) {
            console.error("❌ Users table creation failed:", err.message);
        } else {
            console.log("✅ Users table ready");
        }
    });
}

module.exports = createUsersTable;