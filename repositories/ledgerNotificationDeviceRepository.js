const db =

    require("../db");

exports.save =

async (

    accountId,

    fcmToken,

    platform

) => {

    await db.runAsync(

        `

        INSERT INTO ledger_notification_devices

        (

            account_id,

            fcm_token,

            platform

        )

        VALUES

        (

            ?,

            ?,

            ?

        )

        ON CONFLICT (

            account_id,

            fcm_token

        )

        DO UPDATE SET

            platform = excluded.platform,

            updated_at = CURRENT_TIMESTAMP

        `,

        [

            accountId,

            fcmToken,

            platform

        ]

    );

    return await db.getAsync(

        `

        SELECT

            id,

            account_id,

            fcm_token,

            platform,

            created_at,

            updated_at

        FROM ledger_notification_devices

        WHERE

            account_id = ?

            AND fcm_token = ?

        `,

        [

            accountId,

            fcmToken

        ]

    );

};

exports.getByAccountId =

async (

    accountId

) => {

    return await db.allAsync(

        `

        SELECT

            id,

            account_id,

            fcm_token,

            platform,

            created_at,

            updated_at

        FROM ledger_notification_devices

        WHERE account_id = ?

        ORDER BY id DESC

        `,

        [

            accountId

        ]

    );

};

exports.getTokensByAccountId =

async (

    accountId

) => {

    return await db.allAsync(

        `

        SELECT

            fcm_token

        FROM ledger_notification_devices

        WHERE

            account_id = ?

            AND fcm_token IS NOT NULL

            AND fcm_token != ''

        `,

        [

            accountId

        ]

    );

};

exports.delete =

async (

    accountId,

    fcmToken

) => {

    await db.runAsync(

        `

        DELETE FROM ledger_notification_devices

        WHERE

            account_id = ?

            AND fcm_token = ?

        `,

        [

            accountId,

            fcmToken

        ]

    );

};

exports.deleteAllByAccountId =

async (

    accountId

) => {

    await db.runAsync(

        `

        DELETE FROM ledger_notification_devices

        WHERE account_id = ?

        `,

        [

            accountId

        ]

    );

};
