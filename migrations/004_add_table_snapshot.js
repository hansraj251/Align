module.exports = async (db) => {

    const columns =
        await db.allAsync(
            `PRAGMA table_info(orders)`
        );

    if (
        !columns.some(
            c => c.name === "table_name"
        )
    ) {

        await db.runAsync(
            `
            ALTER TABLE orders
            ADD COLUMN table_name TEXT
            `
        );

        console.log(
            "✓ table_name added"
        );

    }

    if (
        !columns.some(
            c => c.name === "area_name"
        )
    ) {

        await db.runAsync(
            `
            ALTER TABLE orders
            ADD COLUMN area_name TEXT
            `
        );

        console.log(
            "✓ area_name added"
        );

    }

};