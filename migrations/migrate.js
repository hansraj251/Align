const fs = require("fs");
const path = require("path");

const db = require("../db");

(async () => {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS schema_migrations (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            migration TEXT UNIQUE NOT NULL,

            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);

    const files = fs
        .readdirSync(__dirname)
        .filter(file =>
            /^\d+.*\.js$/.test(file)
        )
        .sort();

    for (const file of files) {

        const executed = await db.getAsync(
            `
            SELECT migration
            FROM schema_migrations
            WHERE migration = ?
            `,
            [file]
        );

        if (executed) {

            console.log(`⏭ Skipping ${file}`);
            continue;

        }

        console.log(`▶ Running ${file}`);

        const migration =
            require(path.join(__dirname, file));

        await migration(db);

        await db.runAsync(
            `
            INSERT INTO schema_migrations
            (migration)
            VALUES (?)
            `,
            [file]
        );

        console.log(`✅ ${file} completed`);

    }

    console.log("\n All migrations complete");

    process.exit();

})();