module.exports = async (db) => {

    console.log(
        "📦 Adding order creator columns..."
    );

    const columns =
        await db.allAsync(
            `
            PRAGMA table_info(orders)
            `
        );

    const hasCreatedByStaffId =
        columns.some(
            c => c.name === "created_by_staff_id"
        );

    const hasCreatedByRole =
        columns.some(
            c => c.name === "created_by_role"
        );

    if (!hasCreatedByStaffId) {

        await db.execAsync(
            `
            ALTER TABLE orders
            ADD COLUMN created_by_staff_id INTEGER
            `
        );

    }

    if (!hasCreatedByRole) {

        await db.execAsync(
            `
            ALTER TABLE orders
            ADD COLUMN created_by_role TEXT
            `
        );

    }

    console.log(
        "✅ Order creator columns ready"
    );

};