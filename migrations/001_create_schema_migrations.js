module.exports = async (db) => {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS schema_migrations (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            migration TEXT UNIQUE NOT NULL,

            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);

};