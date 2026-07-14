const db = require("../db");

exports.getDashboardStats = async () => {

    const totalRestaurants =
        await db.getAsync(
            `
            SELECT COUNT(*) AS total
            FROM restaurants
            `
        );

    return {

        totalRestaurants:
            totalRestaurants.total

    };

};

exports.getRestaurants = async () => {

    return await db.allAsync(
        `
        SELECT

            r.id,

            r.restaurant_code,

            r.name,

            r.owner_name,

            r.mobile,

            r.email,

            p.name AS plan,

            r.subscription_status,

            r.plan_start,

            r.plan_end,

            (
                SELECT COUNT(*)

                FROM staff_sessions ss

                WHERE

                    ss.restaurant_id = r.id

                    AND ss.is_active = 1

                    AND ss.role IN ('waiter','device')

                    AND ss.last_seen >= datetime(
                        'now',
                        '-2 minutes'
                    )

            ) AS active_devices,

            r.created_at

        FROM restaurants r

        LEFT JOIN plans p
            ON p.id = r.plan_id

        ORDER BY r.id DESC
        `
    );

};

exports.getRestaurantById = async (
    restaurantId
) => {

    return await db.getAsync(
        `
        SELECT

            r.id,

            r.restaurant_code,

            r.name,

            r.owner_name,

            r.mobile,

            r.email,

            r.address,

            r.city,

            r.state,

            r.pincode,

            r.plan_id,

            p.display_name AS plan,

            r.subscription_status,

            r.plan_start,

            r.plan_end,

            (
                SELECT COUNT(*)

                FROM staff_sessions ss

                WHERE

                    ss.restaurant_id = r.id

                    AND ss.is_active = 1

                    AND ss.role IN ('waiter','device')

                    AND ss.last_seen >= datetime(
                        'now',
                        '-2 minutes'
                    )

            ) AS active_devices,

            (
    SELECT
        pl.limit_value

    FROM plan_limits pl

    WHERE

        pl.plan_id = r.plan_id

        AND pl.limit_key = 'waiter_devices'

    LIMIT 1

) AS allowed_devices

        FROM restaurants r

        LEFT JOIN plans p
            ON p.id = r.plan_id

        WHERE r.id = ?
        `,
        [
            restaurantId
        ]
    );

};
exports.updateRestaurantSubscription =
async (

    restaurantId,

    planId,

    status,

    days

) => {

    if (
    status === "suspended"
) {

    await db.runAsync(
        `
        UPDATE restaurants

        SET

            plan_id = ?,

            subscription_status = ?,

            updated_at =
                CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [

            planId,

            status,

            restaurantId

        ]
    );

    return;

}

if (
    status === "expired"
) {

    await db.runAsync(
        `
        UPDATE restaurants

        SET

            plan_id = ?,

            subscription_status = ?,

            plan_end = CURRENT_TIMESTAMP,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [

            planId,

            status,

            restaurantId

        ]
    );

    return;

}
    

    await db.runAsync(
        `
        UPDATE restaurants

        SET

            plan_id = ?,

            subscription_status = ?,

            plan_start = DATE('now'),

            plan_end = DATE(
                'now',
                '+' || ? || ' days'
            ),

            updated_at =
                CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [

            planId,

            status,

            days,

            restaurantId

        ]
    );

};