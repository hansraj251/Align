const db = require("../db");

exports.getSubscription = async (
    restaurantId
) => {

    return await db.getAsync(
        `
        SELECT

            r.plan_id,

            p.display_name,

            r.subscription_status,

            r.plan_start,

            r.plan_end

        FROM restaurants r

        LEFT JOIN plans p
            ON p.id = r.plan_id

        WHERE r.id = ?
        `,
        [restaurantId]
    );

};

exports.expireSubscription =
async (restaurantId) => {

    await db.runAsync(
        `
        UPDATE restaurants

        SET

            subscription_status =
                'expired',

            updated_at =
                CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
            restaurantId
        ]
    );

};
exports.updateSubscription =
    async (
        restaurantId,
        planId,
        planStart,
        planEnd
    ) =>
{

    await db.runAsync(
        `
        UPDATE restaurants

        SET

            plan_id = ?,

            subscription_status =
                'active',

            plan_start = ?,

            plan_end = ?,

            updated_at =
                CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
            planId,
            planStart,
            planEnd,
            restaurantId
        ]
    );

};
exports.activateSubscription =
    async (
        restaurantId,
        planId
    ) => {

        const plan =
            await planRepository
                .getPlanById(
                    planId
                );

        if (!plan) {

            throw new Error(
                "Plan not found."
            );

        }

        const planStart =
            new Date();

        const planEnd =
            new Date(planStart);

        planEnd.setDate(
            planEnd.getDate() +
            Number(plan.duration_days)
        );

        await subscriptionRepository
            .updateSubscription(

                restaurantId,

                planId,

                planStart
                    .toISOString()
                    .slice(0, 10),

                planEnd
                    .toISOString()
                    .slice(0, 10)

            );

    };