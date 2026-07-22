const db =
    require("../../db");

async function createPaymentSplitsTable() {

    const sql = `
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
    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Payment Splits table ready"
        );

    } catch (err) {

        console.error(
            "❌ Payment Splits table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports =
    createPaymentSplitsTable;