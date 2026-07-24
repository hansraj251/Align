module.exports = async (db) => {

    await db.runAsync(`
        ALTER TABLE kitchen_ticket_items
        ADD COLUMN note TEXT
    `);

};