const db = require("../db");

exports.getPlans = async () => {

    return await db.allAsync(
        `
        SELECT

    id,

    name,

    display_name,

    description,

    price,

    currency,

    duration_days,

    status

        FROM plans

WHERE status = 'active'

ORDER BY id
        `
    );

};

exports.getPlanById = async (planId) => {

    return await db.getAsync(
        `
       SELECT
    id,
    name,
    display_name,
    description,
    price,
    currency,
    duration_days,
    status
FROM plans
WHERE id = ?
        `,
        [planId]
    );

};

exports.updatePlan = async (
    planId,
    displayName,
    description,
    price,
    currency,
    durationDays,
    status
) => {

    await db.runAsync(
        `
        UPDATE plans
        SET

            display_name = ?,

            description = ?,

            price = ?,

            currency = ?,

            duration_days = ?,

            status = ?,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
            displayName,
            description,
            price,
            currency,
            durationDays,
            status,
            planId
        ]
    );

};