module.exports = async (db) => {

    await db.runAsync(`
        ALTER TABLE tables
        ADD COLUMN is_reserved
        INTEGER DEFAULT 0
    `);

    await db.runAsync(`
        ALTER TABLE tables
        ADD COLUMN reserved_name
        TEXT
    `);

};