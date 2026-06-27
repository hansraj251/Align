module.exports = async (db) => {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS restaurant_settings (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER UNIQUE,

            restaurant_name TEXT,

            address TEXT,

            phone TEXT,

            email TEXT,

            gst_number TEXT,

            footer_message TEXT,

            logo TEXT,

            cgst REAL DEFAULT 2.5,

            sgst REAL DEFAULT 2.5,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);

};