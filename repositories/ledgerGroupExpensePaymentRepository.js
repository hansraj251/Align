const db =
    require("../db");

async function getByExpenseId(
    expenseId
) {
    return db.allAsync(
        `
        SELECT
            p.id,
            p.expense_id,
            p.member_id,
            p.amount,
            p.created_at,
            p.updated_at,
            m.account_id,
            m.name AS member_name,
            m.mobile AS member_mobile,
            m.email AS member_email
        FROM ledger_group_expense_payments p
        INNER JOIN ledger_group_members m
            ON m.id = p.member_id
        WHERE
            p.expense_id = ?
        ORDER BY
            m.name COLLATE NOCASE ASC,
            p.id ASC
        `,
        [
            expenseId
        ]
    );
}

async function getById(
    paymentId,
    expenseId
) {
    return db.getAsync(
        `
        SELECT
            id,
            expense_id,
            member_id,
            amount,
            created_at,
            updated_at
        FROM ledger_group_expense_payments
        WHERE
            id = ?
            AND expense_id = ?
        LIMIT 1
        `,
        [
            paymentId,
            expenseId
        ]
    );
}

async function create(
    expenseId,
    memberId,
    amount
) {
    const result =
        await db.runAsync(
            `
            INSERT INTO ledger_group_expense_payments
            (
                expense_id,
                member_id,
                amount
            )
            VALUES
            (
                ?,
                ?,
                ?
            )
            `,
            [
                expenseId,
                memberId,
                amount
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
        DELETE FROM ledger_group_expense_payments
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
