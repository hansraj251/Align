const db = require("../../db");

async function createRestaurantsTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS restaurants (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            owner_name TEXT,

            mobile TEXT,

            email TEXT,

            gst_number TEXT,

            fssai_number TEXT,

            address TEXT,

            city TEXT,

            state TEXT,

            pincode TEXT,

            logo TEXT,
            restaurant_code TEXT UNIQUE,

            plan_id INTEGER,

subscription_status TEXT
    DEFAULT 'trial',

plan_start DATE,

plan_end DATE,

trial_used INTEGER
    DEFAULT 0,

            status TEXT DEFAULT 'active',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `;

    try {
        console.log(sql);

        await db.runAsync(sql);

        console.log(
            "✅ Restaurants table ready"
        );

    } catch (err) {

        console.error(
            "❌ Restaurants table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports = createRestaurantsTable;