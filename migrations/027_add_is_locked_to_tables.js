module.exports = async db => {

    await db.runAsync(`
        ALTER TABLE tables
        ADD COLUMN is_locked
        INTEGER DEFAULT 0
    `);

};