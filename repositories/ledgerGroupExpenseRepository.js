const db =
    require("../db");

async function getById(
    expenseId,
    groupId
) {
    return db.getAsync(
        `
        SELECT
            id,
            group_id,
            added_by_account_id,
            description,
            amount,
            expense_date,
            split_type,
            notes,
            created_at,
            updated_at
        FROM ledger_group_expenses
        WHERE
            id = ?
            AND group_id = ?
        LIMIT 1
        `,
        [
            expenseId,
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
            e.id,
            e.group_id,
            e.added_by_account_id,
            e.description,
            e.amount,
            e.expense_date,
            e.split_type,
            e.notes,
            e.created_at,
            e.updated_at,
            a.name AS added_by_name
        FROM ledger_group_expenses e
        INNER JOIN align_accounts a
            ON a.id = e.added_by_account_id
        WHERE
            e.group_id = ?
        ORDER BY
            e.expense_date DESC,
            e.id DESC
        `,
        [
            groupId
        ]
    );
}

async function create(
    groupId,
    addedByAccountId,
    description,
    amount,
    expenseDate,
    splitType,
    notes
) {
    const result =
        await db.runAsync(
            `
            INSERT INTO ledger_group_expenses
            (
                group_id,
                added_by_account_id,
                description,
                amount,
                expense_date,
                split_type,
                notes
            )
            VALUES
            (
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
                addedByAccountId,
                description,
                amount,
                expenseDate,
                splitType,
                notes
            ]
        );

    return getById(
        result.lastID,
        groupId
    );
}

async function update(
    expenseId,
    groupId,
    description,
    amount,
    expenseDate,
    splitType,
    notes
) {
    await db.runAsync(
        `
        UPDATE ledger_group_expenses
        SET
            description = ?,
            amount = ?,
            expense_date = ?,
            split_type = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            id = ?
            AND group_id = ?
        `,
        [
            description,
            amount,
            expenseDate,
            splitType,
            notes,
            expenseId,
            groupId
        ]
    );

    return getById(
        expenseId,
        groupId
    );
}

async function remove(
    expenseId,
    groupId
) {
    await db.runAsync(
        `
        DELETE FROM ledger_group_expenses
        WHERE
            id = ?
            AND group_id = ?
        `,
        [
            expenseId,
            groupId
        ]
    );
}

module.exports = {
    getById,
    getByGroupId,
    create,
    update,
    remove
};
