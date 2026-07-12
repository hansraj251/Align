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

            id,

            restaurant_code,

            name,

            owner_name,

            mobile,

            email,

            plan,

            subscription_status,

            plan_start,

            plan_end,

            created_at

        FROM restaurants

        ORDER BY id DESC
        `
    );

};