const db =
    require("../db");

async function getById(
    memberId,
    groupId
) {
    return db.getAsync(
        `
        SELECT
            id,
            group_id,
            account_id,
            name,
            mobile,
            email,
            role,
            status,
            joined_at,
            created_at,
            updated_at
        FROM ledger_group_members
        WHERE
            id = ?
            AND group_id = ?
        LIMIT 1
        `,
        [
            memberId,
            groupId
        ]
    );
}

async function getByGroupId(
    groupId
) {
    return db.allAsync(
        `
        SELECT
            id,
            group_id,
            account_id,
            name,
            mobile,
            email,
            role,
            status,
            joined_at,
            created_at,
            updated_at
        FROM ledger_group_members
        WHERE
            group_id = ?
            AND status = 'active'
        ORDER BY
            role = 'owner' DESC,
            name COLLATE NOCASE ASC,
            id ASC
        `,
        [
            groupId
        ]
    );
}

async function getByGroupAndAccount(
    groupId,
    accountId
) {
    return db.getAsync(
        `
        SELECT
            id,
            group_id,
            account_id,
            name,
            mobile,
            email,
            role,
            status,
            joined_at,
            created_at,
            updated_at
        FROM ledger_group_members
        WHERE
            group_id = ?
            AND account_id = ?
        LIMIT 1
        `,
        [
            groupId,
            accountId
        ]
    );
}

async function getByAccountId(
    accountId
) {
    return db.allAsync(
        `
        SELECT
            m.id,
            m.group_id,
            m.account_id,
            m.name,
            m.mobile,
            m.email,
            m.role,
            m.status,
            m.joined_at,
            m.created_at,
            m.updated_at,
            g.name AS group_name,
            g.description AS group_description,
            g.business_id
        FROM ledger_group_members m
        INNER JOIN ledger_groups g
            ON g.id = m.group_id
        WHERE
            m.account_id = ?
            AND m.status = 'active'
            AND g.status = 'active'
        ORDER BY
            g.name COLLATE NOCASE ASC,
            m.id ASC
        `,
        [
            accountId
        ]
    );
}

async function create(
    groupId,
    accountId,
    name,
    mobile,
    email,
    role,
    status,
    joinedAt
) {
    const result =
        await db.runAsync(
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
                ?,
                ?,
                ?
            )
            `,
            [
                groupId,
                accountId,
                name,
                mobile,
                email,
                role,
                status,
                joinedAt
            ]
        );

    return getById(
        result.lastID,
        groupId
    );
}

async function updateStatus(
    memberId,
    groupId,
    status
) {
    await db.runAsync(
        `
        UPDATE ledger_group_members
        SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND group_id = ?
        `,
        [
            status,
            memberId,
            groupId
        ]
    );

    return getById(
        memberId,
        groupId
    );
}

module.exports = {
    getById,
    getByGroupId,
    getByGroupAndAccount,
    getByAccountId,
    create,
    updateStatus
};
