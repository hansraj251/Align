const db = require("../../db");

exports.createKitchenTables = async () => {

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS kitchen_tickets (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    ticket_number TEXT,

    status TEXT DEFAULT 'new',

    ticket_total REAL DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    started_at DATETIME,

    ready_at DATETIME,

    FOREIGN KEY(order_id)
        REFERENCES orders(id)

)
    `);

    await db.runAsync(`
    CREATE TABLE IF NOT EXISTS kitchen_ticket_items (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        ticket_id INTEGER NOT NULL,

        menu_item_id INTEGER NOT NULL,

        item_name TEXT NOT NULL,

        unit_price REAL NOT NULL,

        quantity INTEGER NOT NULL,

        FOREIGN KEY(ticket_id)
            REFERENCES kitchen_tickets(id)

    )
`);

    console.log(
        "✅ Kitchen tables ready"
    );

};