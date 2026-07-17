const db = require("../db");

exports.getDashboardSummary = async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT

            (
                SELECT COUNT(*)
                FROM menu_categories
                WHERE restaurant_id = ?
            ) AS categories,

            (
                SELECT COUNT(*)
                FROM menu_items
                WHERE restaurant_id = ?
                
            ) AS menuItems,

            (
                SELECT IFNULL(SUM(total), 0)
                FROM orders
                WHERE
                    restaurant_id = ?
                    AND status = 'paid'
                    AND DATE(paid_at) = DATE('now','localtime')
            ) AS todaySales,

            (
                SELECT COUNT(*)
                FROM orders
                WHERE
                    restaurant_id = ?
                    AND status = 'paid'
                    AND DATE(paid_at) = DATE('now','localtime')
            ) AS todayOrders,

            (
    SELECT COUNT(*)
    FROM tables
    WHERE
        restaurant_id = ?
        AND status = 'occupied'
        AND (
            system_key IS NULL
            OR system_key != 'takeaway'
        )
) AS occupiedTables,

           (
    SELECT COUNT(*)
    FROM tables
    WHERE
        restaurant_id = ?
        AND (
            system_key IS NULL
            OR system_key != 'takeaway'
        )
) AS totalTables,

            (
    SELECT COUNT(*)

    FROM kitchen_ticket_items kti

    INNER JOIN kitchen_tickets kt
        ON kt.id = kti.ticket_id

    INNER JOIN orders o
        ON o.id = kt.order_id

    WHERE

        o.restaurant_id = ?

        AND kti.status IN (

            'pending',

            'preparing'

        )

) AS pendingKitchen
        `,
       [
    restaurantId,
    restaurantId,
    restaurantId,
    restaurantId,
    restaurantId,
    restaurantId,
    restaurantId
]
    );

};