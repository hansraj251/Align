const db =

    require("../db");

async function getMembers(

    groupId

) {

    return db.allAsync(

        `

        SELECT m.id,
            m.group_id,
            m.account_id,
            a.name AS name,
            m.mobile,
            m.email,
            m.role,
            m.status,
            m.joined_at,
            m.created_at,
            m.updated_at
        FROM ledger_group_members m
        INNER JOIN align_accounts a
            ON a.id = m.account_id
        WHERE group_id = ?
            AND m.status = 'active'
        ORDER BY CASE
            WHEN m.role = 'owner' THEN 0
            ELSE 1
        END,
            a.name COLLATE NOCASE ASC,
            m.id ASC

        `,

        [

            groupId

        ]

    );

}

async function getExpenses(

    groupId

) {

    return db.allAsync(

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

            updated_at,

            (
                SELECT name
                FROM align_accounts
                WHERE id = added_by_account_id
            ) AS added_by_name

        FROM ledger_group_expenses

        WHERE

            group_id = ?

        ORDER BY

            expense_date DESC,

            id DESC

        `,

        [

            groupId

        ]

    );

}

async function getSplits(

    groupId

) {

    return db.allAsync(

        `

        SELECT

            s.id,

            s.expense_id,

            s.member_id,

            s.split_value,

            s.share_amount

        FROM ledger_group_expense_splits s

        INNER JOIN ledger_group_expenses e

            ON e.id = s.expense_id

        INNER JOIN ledger_group_members m

            ON m.id = s.member_id

        WHERE

            e.group_id = ?

            AND m.group_id = ?

            AND m.status = 'active'

        ORDER BY

            s.expense_id ASC,

            s.member_id ASC

        `,

        [

            groupId,

            groupId

        ]

    );

}

async function getPayments(

    groupId

) {

    return db.allAsync(

        `

        SELECT

            p.id,

            p.expense_id,

            p.member_id,

            p.amount

        FROM ledger_group_expense_payments p

        INNER JOIN ledger_group_expenses e

            ON e.id = p.expense_id

        INNER JOIN ledger_group_members m

            ON m.id = p.member_id

        WHERE

            e.group_id = ?

            AND m.group_id = ?

            AND m.status = 'active'

        ORDER BY

            p.expense_id ASC,

            p.member_id ASC

        `,

        [

            groupId,

            groupId

        ]

    );

}

async function getSettlements(

    groupId

) {

    return db.allAsync(

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

            group_id = ?

        ORDER BY

            settlement_date DESC,

            id DESC

        `,

        [

            groupId

        ]

    );

}

module.exports = {

    getMembers,

    getExpenses,

    getSplits,

    getPayments,

    getSettlements

};
