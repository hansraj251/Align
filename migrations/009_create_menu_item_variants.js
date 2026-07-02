module.exports = async (db) => {

    console.log(
        "📦 Creating menu item variants..."
    );

    await db.execAsync(`

        CREATE TABLE IF NOT EXISTS menu_item_variants (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            menu_item_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            price REAL NOT NULL,

            display_order INTEGER DEFAULT 0,

            status INTEGER DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (menu_item_id)
                REFERENCES menu_items(id)
                ON DELETE CASCADE

        );

    `);

    console.log(
        "✅ menu_item_variants table ready"
    );


const count = await db.getAsync(`

    SELECT COUNT(*) AS total

    FROM menu_item_variants

`);

if (count.total === 0) {

    await db.execAsync(`

        INSERT INTO menu_item_variants

        (

            menu_item_id,

            name,

            price,

            display_order

        )

        SELECT

            id,

            'Full',

            price,

            1

        FROM menu_items;

    `);

}
};