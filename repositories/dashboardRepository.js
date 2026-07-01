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
            ) AS occupiedTables,

            (
    SELECT COUNT(*)
    FROM tables
    WHERE
        restaurant_id = ?
) AS totalTables,

            (
                SELECT COUNT(*)
                FROM orders
                WHERE
                    restaurant_id = ?
                    AND status IN (
                        'sent_to_kitchen',
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