const db =
    require("../db");

async function getByGroupId(
    groupId
) {
    return db.allAsync(
        `
        SELECT
            s.id,
            s.group_id,
            s.paid_by_member_id,
            s.paid_to_member_id,
            s.amount,
            s.settlement_date,
            s.notes,
            s.created_at,
            s.updated_at,
            payer.name AS paid_by_name,
            receiver.name AS paid_to_name
        FROM ledger_group_settlements s
        INNER JOIN ledger_group_members payer
            ON payer.id = s.paid_by_member_id
        INNER JOIN ledger_group_members receiver
            ON receiver.id = s.paid_to_member_id
        WHERE
            s.group_id = ?
        ORDER BY
            s.settlement_date DESC,
            s.id DESC
        `,
        [
            groupId
        ]
    );
}

async function getById(
    settlementId,
    groupId
) {
    return db.getAsync(
        `
        SELECT
            id,
            group_id,
            paid_by_member_id,
            paid_to_member_id,
            amount,
            settlement_date,
            notes,
            created_at,
            updated_at
        FROM ledger_group_settlements
        WHERE
            id = ?
            AND group_id = ?
        LIMIT 1
        `,
        [
            settlementId,
            groupId
        ]
    );
}

async function create(
    groupId,
    paidByMemberId,
    paidToMemberId,
    amount,
    settlementDate,
    notes
) {
    const result =
        await db.runAsync(
            `
            INSERT INTO ledger_group_settlements
            (
                group_id,
                paid_by_member_id,
                paid_to_member_id,
                amount,
                settlement_date,
                notes
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
                paidByMemberId,
                paidToMemberId,
                amount,
                settlementDate,
                notes
            ]
        );

    return getById(
        result.lastID,
        groupId
    );
}

async function remove(
    settlementId,
    groupId
) {
    await db.runAsync(
        `
        DELETE FROM ledger_group_settlements
        WHERE
            id = ?
            AND group_id = ?
        `,
        [
            settlementId,
            groupId
        ]
    );
}

module.exports = {
    getByGroupId,
    getById,
    create,
    remove
};
