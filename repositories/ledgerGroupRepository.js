const db =
    require("../db");

async function getById(
    groupId,
    businessId
) {
    return db.getAsync(
        `
        SELECT
            id,
            business_id,
            name,
            description,
            status,
            created_at,
            updated_at
        FROM ledger_groups
        WHERE
            id = ?
            AND business_id = ?
        LIMIT 1
        `,
        [
            groupId,
            businessId
        ]
    );
}

async function getByMemberAccount(

    groupId,

    accountId

) {

    return db.getAsync(

        `

        SELECT

            g.id,

            g.business_id,

            g.name,

            g.description,

            g.status,

            g.created_at,

            g.updated_at

        FROM ledger_groups g

        INNER JOIN ledger_group_members m

            ON m.group_id = g.id

        WHERE

            g.id = ?

            AND m.account_id = ?

            AND m.status = 'active'

            AND g.status = 'active'

        LIMIT 1

        `,

        [

            groupId,

            accountId

        ]

    );

}

async function getByBusinessId(
    businessId
) {
    return db.allAsync(
        `
        SELECT
            id,
            business_id,
            name,
            description,
            status,
            created_at,
            updated_at
        FROM ledger_groups
        WHERE
            business_id = ?
            AND status = 'active'
        ORDER BY
            name COLLATE NOCASE ASC,
            id ASC
        `,
        [
            businessId
        ]
    );
}

async function create(
    businessId,
    name,
    description
) {
    const result =
        await db.runAsync(
            `
            INSERT INTO ledger_groups
            (
                business_id,
                name,
                description
            )
            VALUES
            (
                ?,
                ?,
                ?
            )
            `,
            [
                businessId,
                name,
                description
            ]
        );

    return getById(
        result.lastID,
        businessId
    );
}

async function update(
    groupId,
    businessId,
    name,
    description
) {
    await db.runAsync(
        `
        UPDATE ledger_groups
        SET
            name = ?,
            description = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND business_id = ?
        `,
        [
            name,
            description,
            groupId,
            businessId
        ]
    );

    return getById(
        groupId,
        businessId
    );
}

async function deactivate(
    groupId,
    businessId
) {
    await db.runAsync(
        `
        UPDATE ledger_groups
        SET
            status = 'inactive',
            updated_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND business_id = ?
        `,
        [
            groupId,
            businessId
        ]
    );

    return getById(
        groupId,
        businessId
    );
}

module.exports = {

    getByMemberAccount,

    getById,
    getByBusinessId,
    create,
    update,
    deactivate
};
