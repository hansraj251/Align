module.exports = async (db) => {

    const columns = await db.allAsync(
        `PRAGMA table_info(orders)`
    );

    const hasPaymentMethod =
        columns.some(
            c => c.name === "payment_method"
        );

    if (!hasPaymentMethod) {

        await db.runAsync(
            `
            ALTER TABLE orders
            ADD COLUMN payment_method TEXT
            `
        );

        console.log(
            "✓ payment_method added"
        );

    }

    const hasPaidAt =
        columns.some(
            c => c.name === "paid_at"
        );

    if (!hasPaidAt) {

        await db.runAsync(
            `
            ALTER TABLE orders
            ADD COLUMN paid_at DATETIME
            `
        );

        console.log(
            "✓ paid_at added"
        );

    }

};