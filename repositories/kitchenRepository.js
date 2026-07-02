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
            menu_item_id,
            item_name,
            variant_name,
            unit_price,
            quantity
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            ticketId,
            menuItemId,
            itemName,
            variantName,
            unitPrice,
            quantity
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

            t.name AS table_name,

            o.total

        FROM kitchen_tickets kt

        JOIN orders o

            ON o.id = kt.order_id

        JOIN tables t

            ON t.id = o.table_id

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

    item_name,

    variant_name,

    quantity,

    unit_price

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
            id,
            order_id,
            status
        FROM kitchen_tickets
        WHERE id = ?
        `,
        [
            ticketId
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