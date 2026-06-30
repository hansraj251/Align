const db = require("../db");

exports.getSettings = async (restaurantId) => {

    return await db.getAsync(
    `
    SELECT
        footer_message,
        cgst,
        sgst
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
    updated_at=CURRENT_TIMESTAMP

            WHERE restaurant_id=?
            `,
            [

    settings.footer_message,

    settings.cgst,

    settings.sgst,

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

    sgst

)

VALUES(?,?,?,?)
            `,
            [

    restaurantId,

    settings.footer_message,

    settings.cgst,

    settings.sgst

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