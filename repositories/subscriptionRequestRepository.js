const db =
    require("../db");

exports.createRequest =
    async (
        restaurantId,
        currentPlanId,
        requestedPlanId
    ) =>
{

    const result =
        await db.runAsync(
            `
            INSERT INTO
            subscription_requests
            (
                restaurant_id,

                current_plan_id,

                requested_plan_id
            )

            VALUES
            (
                ?,
                ?,
                ?
            )
            `,
            [
                restaurantId,

                currentPlanId,

                requestedPlanId
            ]
        );

    return result.lastID;

};
exports.getPendingRequestByRestaurantId =
    async (
        restaurantId
    ) =>
{

    return await db.getAsync(
        `
        SELECT
            *
        FROM
            subscription_requests
        WHERE
            restaurant_id = ?
        AND
            status = 'pending'
        `,
        [
            restaurantId
        ]
    );

};
exports.getAllRequests =
    async () =>
{

    return await db.allAsync(
        `
        SELECT

            sr.id,

            sr.restaurant_id,

            r.name
                AS restaurant_name,

            cp.display_name
                AS current_plan,

            rp.display_name
                AS requested_plan,

            sr.status,

            sr.created_at

        FROM subscription_requests sr

        INNER JOIN restaurants r
            ON r.id = sr.restaurant_id

        INNER JOIN plans cp
            ON cp.id =
                sr.current_plan_id

        INNER JOIN plans rp
            ON rp.id =
                sr.requested_plan_id

        ORDER BY
            sr.created_at DESC
        `
    );

};
exports.getRequestById =
    async (
        requestId
    ) =>
{

    console.log(
        "Repository Request ID:",
        requestId
    );

    const request =
        await db.getAsync(
            `
            SELECT
                *
            FROM
                subscription_requests
            WHERE
                id = ?
            `,
            [
                requestId
            ]
        );

    console.log(
        "Repository Result:",
        request
    );

    return request;

};

exports.approveRequest =
    async (
        requestId,
        adminId
    ) =>
{

    await db.runAsync(
        `
        UPDATE
            subscription_requests
        SET
            status = 'approved',

            processed_by = ?,

            updated_at =
                CURRENT_TIMESTAMP
        WHERE
            id = ?
        `,
        [
            adminId,
            requestId
        ]
    );

};

exports.rejectRequest =
    async (
        requestId,
        adminId
    ) =>
{

    await db.runAsync(
        `
        UPDATE
            subscription_requests
        SET
            status = 'rejected',

            processed_by = ?,

            updated_at =
                CURRENT_TIMESTAMP
        WHERE
            id = ?
        `,
        [
            adminId,
            requestId
        ]
    );

};