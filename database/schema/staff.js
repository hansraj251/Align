const db = require("../../db");

async function createStaffTable() {

    const sql = `

        CREATE TABLE IF NOT EXISTS staff (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            staff_code TEXT UNIQUE,

            name TEXT NOT NULL,

            mobile TEXT,

            role TEXT NOT NULL,

            salary_type TEXT DEFAULT 'monthly',

            basic_salary REAL DEFAULT 0,

            joining_date DATE,

            address TEXT,

            emergency_contact TEXT,

            status TEXT DEFAULT 'active',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id)

        )

    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Staff table ready"
        );

    } catch (err) {

        console.error(
            "❌ Staff table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports = createStaffTable;