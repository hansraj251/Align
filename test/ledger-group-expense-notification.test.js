const test = require("node:test");

const assert = require("node:assert/strict");

const ledgerGroupExpenseSplitService =
    require("../services/ledgerGroupExpenseSplitService");

const ledgerGroupExpenseRepository =
    require("../repositories/ledgerGroupExpenseRepository");

const ledgerGroupExpenseSplitRepository =
    require("../repositories/ledgerGroupExpenseSplitRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

const ledgerNotificationService =
    require("../services/ledgerNotificationService");

test("setSplits notifies only members with positive share amount", async () => {

    const originalGetByGroupAndAccount =
        ledgerGroupMemberRepository.getByGroupAndAccount;

    const originalGetExpenseById =
        ledgerGroupExpenseRepository.getById;

    const originalGetMembers =
        ledgerGroupMemberRepository.getByGroupId;

    const originalRemove =
        ledgerGroupExpenseSplitRepository.removeByExpenseId;

    const originalCreate =
        ledgerGroupExpenseSplitRepository.create;

    const originalGetByExpenseId =
        ledgerGroupExpenseSplitRepository.getByExpenseId;

    const originalSendToAccounts =
        ledgerNotificationService.sendToAccounts;

    let notificationArgs = null;

    ledgerGroupMemberRepository.getByGroupAndAccount =
        async () => ({
            id: 1,
            group_id: 10,
            account_id: 100,
            status: "active"
        });

    ledgerGroupExpenseRepository.getById =
        async () => ({
            id: 20,
            group_id: 10,
            added_by_account_id: 100,
            description: "Dinner",
            amount: 3000
        });

    ledgerGroupMemberRepository.getByGroupId =
        async () => ([
            {
                id: 1,
                group_id: 10,
                account_id: 100,
                status: "active"
            },
            {
                id: 2,
                group_id: 10,
                account_id: 200,
                status: "active"
            },
            {
                id: 3,
                group_id: 10,
                account_id: 300,
                status: "active"
            }
        ]);

    ledgerGroupExpenseSplitRepository.removeByExpenseId =
        async () => {};

    ledgerGroupExpenseSplitRepository.create =
        async () => {};

    ledgerGroupExpenseSplitRepository.getByExpenseId =
        async () => ([
            {
                id: 1,
                expense_id: 20,
                member_id: 1,
                account_id: 100,
                split_value: 1000,
                share_amount: 1000
            },
            {
                id: 2,
                expense_id: 20,
                member_id: 2,
                account_id: 200,
                split_value: 2000,
                share_amount: 2000
            },
            {
                id: 3,
                expense_id: 20,
                member_id: 3,
                account_id: 300,
                split_value: 0,
                share_amount: 0
            }
        ]);

    ledgerNotificationService.sendToAccounts =
        async (...args) => {
            notificationArgs = args;
        };

    try {

        const result =
            await ledgerGroupExpenseSplitService.setSplits(
                100,
                10,
                20,
                "custom",
                [
                    {
                        member_id: 1,
                        value: 1000
                    },
                    {
                        member_id: 2,
                        value: 2000
                    },
                    {
                        member_id: 3,
                        value: 0
                    }
                ]
            );

        assert.equal(
            result.length,
            3
        );

        assert.deepEqual(
            notificationArgs[0],
            [
                100,
                200
            ]
        );

        assert.equal(
            notificationArgs[1],
            "Group Expense"
        );

        assert.equal(
            notificationArgs[2],
            "Dinner - ₹3000.00"
        );

        assert.deepEqual(
            notificationArgs[3],
            {
                type: "ledger_group_expense",
                groupId: "10",
                expenseId: "20"
            }
        );

    }
    finally {

        ledgerGroupMemberRepository.getByGroupAndAccount =
            originalGetByGroupAndAccount;

        ledgerGroupExpenseRepository.getById =
            originalGetExpenseById;

        ledgerGroupMemberRepository.getByGroupId =
            originalGetMembers;

        ledgerGroupExpenseSplitRepository.removeByExpenseId =
            originalRemove;

        ledgerGroupExpenseSplitRepository.create =
            originalCreate;

        ledgerGroupExpenseSplitRepository.getByExpenseId =
            originalGetByExpenseId;

        ledgerNotificationService.sendToAccounts =
            originalSendToAccounts;

    }

});
