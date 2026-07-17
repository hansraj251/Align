const db = require("../db");

exports.getReadyOrders = async (
    restaurantId,
    staffId,
    scope
) => {

    let query =
`
SELECT

    kt.id AS ticket_id,

    kt.ticket_number,

    kt.ready_at,

    o.id AS order_id,

    o.order_number,

    o.table_id,

    o.table_name,

    o.area_name,

    o.created_by_staff_id,

    s.name AS waiter_name

FROM kitchen_tickets kt

INNER JOIN orders o

ON o.id = kt.order_id

LEFT JOIN staff s

ON s.id = o.created_by_staff_id

WHERE

    o.restaurant_id = ?

    AND EXISTS (

    SELECT
        1

    FROM kitchen_ticket_items kti

    WHERE

        kti.ticket_id = kt.id

        AND kti.status = 'ready'

)
`;

    const params = [
        restaurantId
    ];

    if (scope === "my") {

        query +=
`
    AND o.created_by_staff_id = ?
`;

        params.push(
            staffId
        );

    }

    query +=
`
ORDER BY

    kt.ready_at ASC,

    kt.id ASC
`;

    return await db.allAsync(
        query,
        params
    );

};

exports.getReadyOrderItems = async (
    ticketId
) => {

    return await db.allAsync(
`
SELECT

    id,

    order_item_id,

    item_name,

    variant_name,

    quantity,

    status,

    ready_at

FROM kitchen_ticket_items

WHERE

    ticket_id = ?

    AND status = 'ready'

ORDER BY id
`,
        [
            ticketId
        ]
    );

};
exports.getTicketById = (ticketId, restaurantId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                kt.id,
                kt.order_id,
                kt.status
            FROM kitchen_tickets kt
            INNER JOIN orders o
                ON o.id = kt.order_id
            WHERE
                kt.id = ?
                AND o.restaurant_id = ?
        `;

        db.get(
            sql,
            [
                ticketId,
                restaurantId
            ],
            (err, row) => {

                if (err) {

                    return reject(err);

                }

                resolve(row);

            }
        );

    });

};
exports.markTicketItemsServed = (ticketId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE kitchen_ticket_items
            SET
                status = 'served'
            WHERE
                ticket_id = ?
                AND status = 'ready'
        `;

        db.run(
            sql,
            [ticketId],
            function (err) {

                if (err) {

                    return reject(err);

                }

                resolve(this.changes);

            }
        );

    });

};
exports.markTicketServed = (ticketId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE kitchen_tickets
            SET
                status = 'served'
            WHERE
                id = ?
        `;

        db.run(
            sql,
            [ticketId],
            function (err) {

                if (err) {

                    return reject(err);

                }

                resolve(this.changes);

            }
        );

    });

};
exports.hasPendingKitchenItems = (
    orderId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                COUNT(*) AS total
            FROM kitchen_ticket_items kti
            INNER JOIN kitchen_tickets kt
                ON kt.id = kti.ticket_id
            WHERE
                kt.order_id = ?
                AND kti.status IN (
                    'pending',
                    'preparing',
                    'ready'
                )
        `;

        db.get(
            sql,
            [
                orderId
            ],
            (err, row) => {

                if (err) {

                    return reject(err);

                }

                resolve(row.total > 0);

            }
        );

    });

};
exports.markOrderReadyForBilling = (
    orderId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE orders
            SET
                status = 'ready_for_billing',
                updated_at = CURRENT_TIMESTAMP
            WHERE
                id = ?
        `;

        db.run(
            sql,
            [
                orderId
            ],
            function (err) {

                if (err) {

                    return reject(err);

                }

                resolve(this.changes);

            }
        );

    });

};
exports.markItemServed = (
    itemId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE kitchen_ticket_items
            SET
                status = 'served'
            WHERE
                id = ?
                AND status = 'ready'
        `;

        db.run(
            sql,
            [
                itemId
            ],
            function (err) {

                if (err) {

                    return reject(err);

                }

                resolve(this.changes);

            }
        );

    });

};
exports.getTicketByItemId = (
    itemId,
    restaurantId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT

                kt.id,

                kt.order_id

            FROM kitchen_ticket_items kti

            INNER JOIN kitchen_tickets kt
                ON kt.id = kti.ticket_id

            INNER JOIN orders o
                ON o.id = kt.order_id

            WHERE

                kti.id = ?

                AND o.restaurant_id = ?
        `;

        db.get(
            sql,
            [
                itemId,
                restaurantId
            ],
            (err, row) => {

                if (err) {

                    return reject(err);

                }

                resolve(row);

            }
        );

    });

};
exports.hasReadyItemsInTicket = (
    ticketId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                COUNT(*) AS count
            FROM kitchen_ticket_items
            WHERE
                ticket_id = ?
                AND status = 'ready'
        `;

        db.get(
            sql,
            [
                ticketId
            ],
            (err, row) => {

                if (err) {

                    return reject(err);

                }

                resolve(row.count > 0);

            }
        );

    });

};
exports.hasPendingKitchenItems = (
    orderId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                COUNT(*) AS count
            FROM kitchen_ticket_items kti

            INNER JOIN kitchen_tickets kt
                ON kt.id = kti.ticket_id

            WHERE
                kt.order_id = ?
                AND kti.status IN (
                    'pending',
                    'preparing',
                    'ready'
                )
        `;

        db.get(
            sql,
            [
                orderId
            ],
            (err, row) => {

                if (err) {

                    return reject(err);

                }

                resolve(row.count > 0);

            }
        );

    });

};