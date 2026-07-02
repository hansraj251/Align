module.exports = async (db) => {

    console.log(
        "📦 Adding variant snapshot to order_items..."
    );

    const columns =
        await db.allAsync(
            `
            PRAGMA table_info(order_items)
            `
        );

    const hasVariantId =
        columns.some(
            c => c.name === "variant_id"
        );

    const hasVariantName =
        columns.some(
            c => c.name === "variant_name"
        );

    if (!hasVariantId) {

        await db.execAsync(
            `
            ALTER TABLE order_items
            ADD COLUMN variant_id INTEGER
            `
        );

    }

    if (!hasVariantName) {

        await db.execAsync(
            `
            ALTER TABLE order_items
            ADD COLUMN variant_name TEXT
            `
        );

    }

    console.log(
        "✅ Variant snapshot columns ready"
    );

};