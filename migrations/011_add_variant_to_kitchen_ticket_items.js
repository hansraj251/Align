module.exports = async (db) => {

    console.log(
        "📦 Adding variant to kitchen tickets..."
    );

    const columns =
        await db.allAsync(
            `
            PRAGMA table_info(kitchen_ticket_items)
            `
        );

    if (
        !columns.some(
            c => c.name === "variant_name"
        )
    ) {

        await db.execAsync(
            `
            ALTER TABLE kitchen_ticket_items
            ADD COLUMN variant_name TEXT
            `
        );

    }

    console.log(
        "✅ Kitchen variant column ready"
    );

};