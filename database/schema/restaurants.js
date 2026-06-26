const db = require("../../db");

function createRestaurantsTable() {
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

            status TEXT DEFAULT 'active',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(sql, (err) => {
        if (err) {
            console.error("❌ Restaurants table creation failed:", err.message);
        } else {
            console.log("✅ Restaurants table ready");
        }
    });
}

module.exports = createRestaurantsTable;