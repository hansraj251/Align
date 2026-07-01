module.exports = async (db) => {

    console.log(
        "📦 Migrating order_items snapshot..."
    );

    await db.execAsync("PRAGMA foreign_keys = OFF;");

    await db.execAsync(`

        CREATE TABLE order_items_new (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            order_id INTEGER NOT NULL,

            menu_item_id INTEGER,

            item_name TEXT NOT NULL,

            food_type TEXT,

            quantity INTEGER DEFAULT 1,

            unit_price REAL NOT NULL,

            total_price REAL NOT NULL,

            notes TEXT,

            status TEXT DEFAULT 'pending',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (order_id)
                REFERENCES orders(id)

        );

    `);

    await db.execAsync(`

        INSERT INTO order_items_new (

            id,
            order_id,
            menu_item_id,
            item_name,
            food_type,
            quantity,
            unit_price,
            total_price,
            notes,
            status,
            created_at

        )

        SELECT

    oi.id,

    oi.order_id,

    oi.menu_item_id,

    COALESCE(
        m.name,
        'Deleted Menu Item'
    ),

    COALESCE(
        m.food_type,
        'veg'
    ),

    oi.quantity,

    oi.unit_price,

    oi.total_price,

    oi.notes,

    oi.status,

    oi.created_at

FROM order_items oi

LEFT JOIN menu_items m

ON m.id = oi.menu_item_id;

    `);

    await db.execAsync(
        "DROP TABLE order_items;"
    );

    await db.execAsync(
        "ALTER TABLE order_items_new RENAME TO order_items;"
    );

    await db.execAsync(
        "PRAGMA foreign_keys = ON;"
    );

    console.log(
        "✅ order_items snapshot migration completed"
    );

};