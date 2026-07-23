const db = require("../db");

exports.createTicket = async (orderId) => {

    const result =

        await db.runAsync(

            `

            INSERT INTO kitchen_tickets

            (

                order_id

            )

            VALUES (?)

            `,

            [

                orderId

            ]

        );

    return result.lastID;

};

exports.updateTicketNumber = async (
    ticketId,
    ticketNumber
) => {

    await db.runAsync(
        `
        UPDATE kitchen_tickets
        SET ticket_number = ?
        WHERE id = ?
        `,
        [
            ticketNumber,
            ticketId
        ]
    );

    return ticketNumber;

};

exports.createTicketItem = async (
    ticketId,
    orderItemId,
    menuItemId,
    itemName,
    variantName,
    unitPrice,
    quantity
) => {

    await db.runAsync(
        `
       INSERT INTO kitchen_ticket_items
(
    ticket_id,
    order_item_id,
    menu_item_id,
    item_name,
    variant_name,
    unit_price,
    quantity,
    status
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [

    ticketId,

    orderItemId,

    menuItemId,

    itemName,

    variantName,

    unitPrice,

    quantity,

    "pending"

]
    );

};

exports.getActiveTickets = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT

    kt.id,

    kt.ticket_number,

    kt.status,

    kt.created_at,

    o.order_number,

    o.area_name,

    o.table_name,

    o.total

        FROM kitchen_tickets kt

        JOIN orders o

            ON o.id = kt.order_id

        WHERE

            o.restaurant_id = ?

            AND kt.status IN
            (
                'new',
                'preparing',
                'ready'
            )

        ORDER BY

            kt.created_at ASC
        `,
        [
            restaurantId
        ]
    );

};

exports.updateTicketStatus = async (
    ticketId,
    status
) => {

    await db.runAsync(
        `
        UPDATE kitchen_tickets
        SET status = ?
        WHERE id = ?
        `,
        [
            status,
            ticketId
        ]
    );

};

exports.getTicketItems = async (
    ticketId
) => {

    return await db.allAsync(
        `
        SELECT

            id,

            ticket_id,

            order_item_id,

            menu_item_id,

            item_name,

            variant_name,

            quantity,

            unit_price,

            status

        FROM kitchen_ticket_items

        WHERE ticket_id = ?

        ORDER BY id
        `,
        [
            ticketId
        ]
    );

};

exports.updateTicketStatus = async (
    ticketId,
    status
) => {

    let query = `
        UPDATE kitchen_tickets
        SET
            status = ?
    `;

    const params = [
        status
    ];

    if (status === "preparing") {

        query += `,
            started_at = CURRENT_TIMESTAMP
        `;

    }

    if (status === "ready") {

        query += `,
            ready_at = CURRENT_TIMESTAMP
        `;

    }

    query += `
        WHERE id = ?
    `;

    params.push(ticketId);

    await db.runAsync(
        query,
        params
    );

};
exports.getTicketById = async (
    ticketId
) => {

    return await db.getAsync(
        `
        SELECT

            kt.id,

            kt.order_id,

            kt.ticket_number,

            kt.status,

            o.restaurant_id,

            o.created_by_staff_id,

            o.table_id,

            o.table_name,

            o.area_name

        FROM kitchen_tickets kt

        JOIN orders o
            ON o.id = kt.order_id

        WHERE kt.id = ?
        `,
        [
            ticketId
        ]
    );

};
exports.getActiveTicketsByOrder = async (
    orderId
) => {

    return await db.allAsync(
        `
        SELECT
            id
        FROM kitchen_tickets
        WHERE
            order_id = ?
            AND status IN (
    'new',
    'preparing',
    'ready',
    'served'
)
        ORDER BY id
        `,
        [
            orderId
        ]
    );

};
exports.updateOrderItemsStatus = async (
    orderId,
    status
) => {

    await db.runAsync(
        `
        UPDATE order_items
        SET
            status = ?
        WHERE
            order_id = ?
        `,
        [
            status,
            orderId
        ]
    );

};

exports.getActiveTicketCountByOrder = async (
    orderId
) => {

    const row =
        await db.getAsync(
            `
            SELECT
                COUNT(*) AS total
            FROM kitchen_tickets
            WHERE
                order_id = ?
                AND status IN (
                    'new',
                    'preparing',
                    'ready'
                )
            `,
            [
                orderId
            ]
        );

    return row.total;

};
exports.getLastKotNumberForToday = async () => {

    const today = new Date();

    const date =
        `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    return await db.getAsync(
        `
        SELECT
            ticket_number
        FROM kitchen_tickets
        WHERE
            ticket_number LIKE ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [
            `KOT-${date}-%`
        ]
    );

};
exports.updateTicketStatusByOrder = async (
    orderId,
    status
) => {

    await db.runAsync(
        `
        UPDATE kitchen_tickets
        SET
            status = ?
        WHERE
            order_id = ?
            AND status != 'served'
        `,
        [
            status,
            orderId
        ]
    );

};

exports.getTicketItem = async (
    ticketItemId
) => {

    return await db.getAsync(
        `
        SELECT

            kti.id,

            kti.ticket_id,

            kti.item_name,

            kti.status,

            kt.ticket_number,

            kt.order_id,

            o.restaurant_id,

            o.created_by_staff_id,

            o.table_name,

            o.area_name


        FROM kitchen_ticket_items kti

        JOIN kitchen_tickets kt
            ON kt.id = kti.ticket_id

        JOIN orders o
            ON o.id = kt.order_id

        WHERE kti.id = ?
        `,
        [ticketItemId]
    );

};

exports.getPendingTicketItems = async (
    ticketId
) => {

    const row =
        await db.getAsync(
            `
            SELECT
    COUNT(*) AS total
FROM kitchen_ticket_items
WHERE
    ticket_id = ?
    AND status IN (
        'pending',
        'preparing'
    )
            `,
            [ticketId]
        );

    return row.total;

};
exports.getReadyTicketItems = async (
    ticketId
) => {

    const row =
        await db.getAsync(

            `
SELECT
    COUNT(*) AS total
FROM kitchen_ticket_items
WHERE
    ticket_id = ?
    AND status = 'ready'
`,

            [ticketId]

        );

    return row.total;

};
exports.updateTicketItemsStatus = async (
    ticketId,
    status
) => {

    let query = `
        UPDATE kitchen_ticket_items
        SET
            status = ?
    `;

    const params = [status];

    if (status === "preparing") {

        query += `,
            started_at = CURRENT_TIMESTAMP`;

    }

    if (status === "ready") {

        query += `,
            ready_at = CURRENT_TIMESTAMP`;

    }
    if (status === "served") {

    query += `,
        served_at = CURRENT_TIMESTAMP`;

}

    query += `
    WHERE
        ticket_id = ?
`;

params.push(ticketId);

if (status === "preparing") {

    query += `
        AND status = 'pending'
    `;

}

if (status === "ready") {

    query += `
        AND status = 'preparing'
    `;

}
if (status === "served") {

    query += `

        AND status = 'ready'

    `;

}

    await db.runAsync(
        query,
        params
    );

};
exports.updateTicketItemStatus = async (
    ticketItemId,
    status
) => {

    let query = `
        UPDATE kitchen_ticket_items
        SET
            status = ?
    `;

    const params = [
        status
    ];

    if (status === "preparing") {

        query += `,
            started_at = CURRENT_TIMESTAMP
        `;

    }

    if (status === "ready") {

        query += `,
            ready_at = CURRENT_TIMESTAMP
        `;

    }

    if (status === "served") {

        query += `,
            served_at = CURRENT_TIMESTAMP
        `;

    }

    query += `
        WHERE id = ?
    `;

    params.push(ticketItemId);

    await db.runAsync(
        query,
        params
    );
    

};

exports.cancelTicketItem = async (
    ticketItemId
) => {

    await db.runAsync(
        `
        UPDATE kitchen_ticket_items
        SET
            status = 'cancelled'
        WHERE
            id = ?
            AND status = 'pending'
        `,
        [ticketItemId]
    );

};
exports.adminCancelTicketItem = async (
    ticketItemId
) => {

    const result =
        await db.runAsync(
            `
            UPDATE kitchen_ticket_items
            SET
                status = 'cancelled'
            WHERE
                id = ?
                AND status IN (
                    'pending',
                    'preparing',
                    'ready'
                )
            `,
            [ticketItemId]
        );

    return result.changes;

};
exports.closeTicket = async (
    ticketId
) => {

    await db.runAsync(
        `
        UPDATE kitchen_tickets
        SET
            status = 'closed'
        WHERE
            id = ?
        `,
        [ticketId]
    );

};
exports.closeAllTicketsByOrder = async (
    orderId
) => {

    await db.runAsync(
        `
        UPDATE kitchen_tickets
        SET status = 'closed'
        WHERE
            order_id = ?
            AND status IN (
                'new',
                'preparing',
                'ready'
            )
        `,
        [orderId]
    );

};