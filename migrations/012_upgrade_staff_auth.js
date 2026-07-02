module.exports = async (db) => {

    console.log(
        "📦 Upgrading staff authentication..."
    );

    const columns =
        await db.allAsync(
            `
            PRAGMA table_info(staff)
            `
        );

    const hasUsername =
        columns.some(
            c => c.name === "username"
        );

    const hasPassword =
        columns.some(
            c => c.name === "password"
        );

    const hasLastLogin =
        columns.some(
            c => c.name === "last_login"
        );

    if (!hasUsername) {

        await db.execAsync(
            `
            ALTER TABLE staff
            ADD COLUMN username TEXT
            `
        );

    }

    if (!hasPassword) {

        await db.execAsync(
            `
            ALTER TABLE staff
            ADD COLUMN password TEXT
            `
        );

    }

    if (!hasLastLogin) {

        await db.execAsync(
            `
            ALTER TABLE staff
            ADD COLUMN last_login DATETIME
            `
        );

    }

    console.log(
        "✅ Staff authentication ready"
    );

};