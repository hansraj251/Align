const db = require("../db");

exports.getSettings = async (restaurantId) => {

    return await db.getAsync(
    `
   SELECT
    footer_message,
    cgst,
    sgst,
    currency,
    time_zone
FROM restaurant_settings
    WHERE restaurant_id = ?
    `,
    [restaurantId]
);

};

exports.saveSettings = async (
    restaurantId,
    settings
) => {

    const existing =
        await exports.getSettings(restaurantId);

    if (existing) {

        await db.runAsync(
            `
            UPDATE restaurant_settings
SET

    footer_message=?,
    cgst=?,
    sgst=?,
    currency=?,
    time_zone=?,
    updated_at=CURRENT_TIMESTAMP

WHERE restaurant_id=?
            `,
            [
    settings.footer_message,

    settings.cgst,

    settings.sgst,

    settings.currency,

    settings.time_zone,

    restaurantId
]
        );


    } else {

        await db.runAsync(
            `
           INSERT INTO restaurant_settings(

    restaurant_id,

    footer_message,

    cgst,

    sgst,

    currency,

    time_zone

)

VALUES(?,?,?,?,?,?)
            `,
            [
    restaurantId,

    settings.footer_message,

    settings.cgst,

    settings.sgst,

    settings.currency,

    settings.time_zone
]
        );

    }

};
exports.getReceiptSettings = async (
    restaurantId
) => {

    const settings = await db.getAsync(
        `
        SELECT
            footer_message
        FROM restaurant_settings
        WHERE restaurant_id = ?
        `,
        [restaurantId]
    );

    return settings || {
        footer_message: "Thank You! Visit Again."
    };

};