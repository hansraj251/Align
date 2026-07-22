module.exports = async (db) => {

    console.log(
        "📦 Creating payment splits table..."
    );

    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS payment_splits (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            order_id INTEGER NOT NULL,

            payment_method TEXT NOT NULL,

            amount REAL NOT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (order_id)
                REFERENCES orders(id)
                ON DELETE CASCADE

        )
        `
    );

    console.log(
        "✅ Payment Splits table ready"
    );

};