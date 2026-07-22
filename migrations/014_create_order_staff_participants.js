module.exports = async (db) => {

    console.log(
        "📦 Creating order staff participants table..."
    );

    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS order_staff_participants (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            order_id INTEGER NOT NULL,

            staff_id INTEGER NOT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (

                order_id,
                staff_id

            ),

            FOREIGN KEY (order_id)
                REFERENCES orders(id)
                ON DELETE CASCADE,

            FOREIGN KEY (staff_id)
                REFERENCES staff(id)
                ON DELETE CASCADE

        )
        `
    );

    console.log(
        "✅ Order staff participants table ready"
    );

};