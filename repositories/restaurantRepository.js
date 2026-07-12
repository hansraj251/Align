const db = require("../db");

exports.getRestaurant = async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT

            id,
            name,
            owner_name,
            mobile,
            email,
            gst_number,
            fssai_number,
            address,
            city,
            state,
            pincode,
            logo

        FROM restaurants
        WHERE id = ?
        `,
        [restaurantId]
    );

};

exports.updateRestaurant = async (
    restaurantId,
    restaurant
) => {

    await db.runAsync(
        `
        UPDATE restaurants
        SET

            name = ?,
            owner_name = ?,
            mobile = ?,
            email = ?,
            gst_number = ?,
            fssai_number = ?,
            address = ?,
            city = ?,
            state = ?,
            pincode = ?,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [

            restaurant.name,
            restaurant.owner_name,
            restaurant.mobile,
            restaurant.email,
            restaurant.gst_number,
            restaurant.fssai_number,
            restaurant.address,
            restaurant.city,
            restaurant.state,
            restaurant.pincode,
            restaurantId

        ]
    );

};
exports.getRestaurantForReceipt = async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT
            name,
            logo,
            mobile,
            email,
            gst_number,
            address,
            city,
            state,
            pincode
        FROM restaurants
        WHERE id = ?
        `,
        [restaurantId]
    );

};
exports.updateLogo = async (
    restaurantId,
    logo
) => {

    await db.runAsync(
        `
        UPDATE restaurants
        SET

            logo = ?,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
            logo,
            restaurantId
        ]
    );

};

exports.getPlanDetails = async (restaurantId) => {

    return await db.getAsync(
        `
        SELECT

            plan_id,
            subscription_status,
            plan_start,
            plan_end

        FROM restaurants
        WHERE id = ?
        `,
        [restaurantId]
    );

};