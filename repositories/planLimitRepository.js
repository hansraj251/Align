const db = require("../db");

exports.getLimit = async (planId, limitKey) => {

    return await db.getAsync(
        `
        SELECT
            limit_value
        FROM plan_limits
        WHERE
            plan_id = ?
            AND limit_key = ?
        LIMIT 1
        `,
        [planId, limitKey]
    );

};

exports.getWaiterDeviceLimit = async (planId) => {

    const limit = await exports.getLimit(
        planId,
        "waiter_devices"
    );

    return limit ? limit.limit_value : null;

};
exports.updateWaiterDeviceLimit =
async (
    planId,
    value
) => {

    await db.runAsync(
        `
        UPDATE plan_limits

        SET

            limit_value = ?

        WHERE

            plan_id = ?

            AND limit_key =
                'waiter_devices'
        `,
        [
            value,
            planId
        ]
    );

};