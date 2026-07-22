const db =
    require("../../db");

async function createStaffSessionsTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS staff_sessions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            staff_id INTEGER NOT NULL,

            role TEXT NOT NULL,

            login_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            logout_at DATETIME,

            is_active INTEGER DEFAULT 1,

            device_info TEXT,

            ip_address TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id),

            FOREIGN KEY (staff_id)
                REFERENCES staff(id)

        )
    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Staff Sessions table ready"
        );

    } catch (err) {

        console.error(
            "❌ Staff Sessions table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports =
    createStaffSessionsTable;