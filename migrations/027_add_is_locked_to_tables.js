const db = require("../db");

module.exports = async () =>
{
    const columns =
        await db.allAsync(
            "PRAGMA table_info(tables)"
        );

    const hasColumn =
        columns.some(
            column => column.name === "is_locked"
        );

    if (hasColumn)
    {
        console.log(
            "✓ 027_add_is_locked_to_tables"
        );

        return;
    }

    await db.runAsync(`
        ALTER TABLE tables
        ADD COLUMN is_locked
        INTEGER DEFAULT 0
    `);

    console.log(
        "✓ 027_add_is_locked_to_tables"
    );
};