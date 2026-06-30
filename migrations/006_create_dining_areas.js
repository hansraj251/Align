async function columnExists(
    db,
    table,
    column
) {

    const columns =
        await db.allAsync(
            `PRAGMA table_info(${table})`
        );

    return columns.some(
        c => c.name === column
    );

}

module.exports = async (db) => {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS dining_areas (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            restaurant_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            display_order INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (restaurant_id)
                REFERENCES restaurants(id)

        )
    `);

    const hasAreaId =
        await columnExists(
            db,
            "tables",
            "area_id"
        );

    if (!hasAreaId) {

        await db.runAsync(`
            ALTER TABLE tables
            ADD COLUMN area_id INTEGER
        `);

        console.log(
            "✅ Added area_id to tables"
        );

    }

    console.log(
        "✅ Dining Areas migration complete"
    );

};