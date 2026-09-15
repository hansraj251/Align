const db =
    require("../db");

async function getById(
    invitationId
) {
    return db.getAsync(
        `
        SELECT
            id,
            group_id,
            invited_by_account_id,
            invited_account_id,
            name,
            mobile,
            email,
            status,
            created_at,
            updated_at
        FROM ledger_group_invitations
        WHERE id = ?
        LIMIT 1
        `,
        [
            invitationId
        ]
    );
}

async function getPendingByAccountId(
    accountId
) {
    return db.allAsync(
        `
        SELECT
            i.id,
            i.group_id,
            i.invited_by_account_id,
            i.invited_account_id,
            i.name,
            i.mobile,
            i.email,
            i.status,
            i.created_at,
            i.updated_at,
            g.name AS group_name,
            a.name AS invited_by_name
        FROM ledger_group_invitations i
        INNER JOIN ledger_groups g
            ON g.id = i.group_id
        INNER JOIN align_accounts a
            ON a.id = i.invited_by_account_id
        WHERE
            i.invited_account_id = ?
            AND i.status = 'pending'
            AND g.status = 'active'
        ORDER BY
            i.id DESC
        `,
        [
            accountId
        ]
    );
}

async function getPendingByGroupAndAccount(
    groupId,
    accountId
) {
    return db.getAsync(
        `
        SELECT
            id,
            group_id,
            invited_by_account_id,
            invited_account_id,
            name,
            mobile,
            email,
            status,
            created_at,
            updated_at
        FROM ledger_group_invitations
        WHERE
            group_id = ?
            AND invited_account_id = ?
            AND status = 'pending'
        ORDER BY id DESC
        LIMIT 1
        `,
        [
            groupId,
            accountId
        ]
    );
}

async function create(
    groupId,
    invitedByAccountId,
    invitedAccountId,
    name,
    mobile,
    email
) {
    const result =
        await db.runAsync(
            `
            INSERT INTO ledger_group_invitations
            (
                group_id,
                invited_by_account_id,
                invited_account_id,
                name,
                mobile,
                email
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                groupId,
                invitedByAccountId,
                invitedAccountId,
                name,
                mobile,
                email
            ]
        );

    return getById(
        result.lastID
    );
}

async function acceptInvitationAndCreateMember(

    invitationId,

    accountId,

    groupId,

    name,

    mobile,

    email,

    joinedAt

) {

    return db.transaction(

        async (transactionDb) => {

            const invitationResult =

                await transactionDb.runAsync(

                    `

                    UPDATE ledger_group_invitations

                    SET

                        status = 'accepted',

                        updated_at = CURRENT_TIMESTAMP

                    WHERE

                        id = ?

                        AND invited_account_id = ?

                        AND status = 'pending'

                    `,

                    [

                        invitationId,

                        accountId

                    ]

                );

            if (

                invitationResult.changes !== 1

            ) {

                throw new Error(

                    "Invitation not found"

                );

            }

            const memberResult =

                await transactionDb.runAsync(

                    `

                    INSERT INTO ledger_group_members

                    (

                        group_id,

                        account_id,

                        name,

                        mobile,

                        email,

                        role,

                        status,

                        joined_at

                    )

                    VALUES

                    (

                        ?,

                        ?,

                        ?,

                        ?,

                        ?,

                        'member',

                        'active',

                        ?

                    )

                    `,

                    [

                        groupId,

                        accountId,

                        name,

                        mobile,

                        email,

                        joinedAt

                    ]

                );

            return transactionDb.getAsync(

                `

                SELECT

                    id,

                    group_id,

                    invited_by_account_id,

                    invited_account_id,

                    name,

                    mobile,

                    email,

                    status,

                    created_at,

                    updated_at

                FROM ledger_group_invitations

                WHERE id = ?

                LIMIT 1

                `,

                [

                    invitationId

                ]

            );

        }

    );

}

async function updateStatus(
    invitationId,
    accountId,
    status
) {
    await db.runAsync(
        `
        UPDATE ledger_group_invitations
        SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND invited_account_id = ?
            AND status = 'pending'
        `,
        [
            status,
            invitationId,
            accountId
        ]
    );

    return getById(
        invitationId
    );
}

module.exports = {

    acceptInvitationAndCreateMember,

    getById,
    getPendingByAccountId,
    getPendingByGroupAndAccount,
    create,
    updateStatus
};
