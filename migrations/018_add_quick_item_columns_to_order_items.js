module.exports = async (db) => {

    try {

        await db.runAsync(`
            ALTER TABLE order_items
            ADD COLUMN quick_item_id INTEGER
        `);

    } catch (err) {

        if (!err.message.includes("duplicate column")) {

            throw err;

        }

    }

    try {

        await db.runAsync(`
            ALTER TABLE order_items
            ADD COLUMN is_quick_item INTEGER DEFAULT 0
        `);

    } catch (err) {

        if (!err.message.includes("duplicate column")) {

            throw err;

        }

    }

};