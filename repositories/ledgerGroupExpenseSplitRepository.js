const db =
    require("../db");

async function getByExpenseId(
    expenseId
) {
    return db.allAsync(
        `
        SELECT
            s.id,
            s.expense_id,
            s.member_id,
            s.split_value,
            s.share_amount,
            s.created_at,
            s.updated_at,
            m.account_id,
            m.name AS member_name,
            m.mobile AS member_mobile,
            m.email AS member_email
        FROM ledger_group_expense_splits s
        INNER JOIN ledger_group_members m
            ON m.id = s.member_id
        WHERE
            s.expense_id = ?
        ORDER BY
            m.name COLLATE NOCASE ASC,
            s.id ASC
        `,
        [
            expenseId
        ]
    );
}

async function getById(
    splitId,
    expenseId
) {
    return db.getAsync(
        `
        SELECT
            id,
            expense_id,
            member_id,
            split_value,
            share_amount,
            created_at,
            updated_at
        FROM ledger_group_expense_splits
        WHERE
            id = ?
            AND expense_id = ?
        LIMIT 1
        `,
        [
            splitId,
            expenseId
        ]
    );
}

async function create(
    expenseId,
    memberId,
    splitValue,
    shareAmount
) {
    const result =
        await db.runAsync(
            `
            INSERT INTO ledger_group_expense_splits
            (
                expense_id,
                member_id,
                split_value,
                share_amount
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                expenseId,
                memberId,
                splitValue,
                shareAmount
            ]
        );

    return getById(
        result.lastID,
        expenseId
    );
}

async function removeByExpenseId(
    expenseId
) {
    await db.runAsync(
        `
        DELETE FROM ledger_group_expense_splits
        WHERE expense_id = ?
        `,
        [
            expenseId
        ]
    );
}

module.exports = {
    getByExpenseId,
    getById,
    create,
    removeByExpenseId
};
