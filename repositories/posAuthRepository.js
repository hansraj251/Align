const db = require("../db");

exports.getUserWithRestaurantByEmail = async (email) => {

    const sql = `
        SELECT

            u.id,
            u.restaurant_id,
            u.name,
            u.email,
            u.mobile,
            u.password,
            u.role,
            u.status,

            r.id AS restaurant_id,
            r.name AS restaurant_name,
            r.owner_name,
            r.mobile AS restaurant_mobile,
            r.email AS restaurant_email,
            r.gst_number,
            r.fssai_number,
            r.address,
            r.city,
            r.state,
            r.pincode,
            r.logo,
            r.restaurant_code,
            r.plan_id,
            r.subscription_status,
            r.plan_start,
            r.plan_end,
            r.trial_used,
            r.status AS restaurant_status

        FROM users u

        INNER JOIN restaurants r
            ON r.id = u.restaurant_id

        WHERE u.email = ?
    `;

    return await db.getAsync(
        sql,
        [email]
    );

};