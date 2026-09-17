const test = require("node:test");

const assert = require("node:assert/strict");

const ledgerGroupSummaryService =
    require("../services/ledgerGroupSummaryService");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

const ledgerGroupRepository =
    require("../repositories/ledgerGroupRepository");

const ledgerGroupSummaryRepository =
    require("../repositories/ledgerGroupSummaryRepository");

test(
    "settlement reduces receiver get and payer pay balances",
    async () => {

        const originalMemberAccess =
            ledgerGroupMemberRepository
                .getByGroupAndAccount;

        const originalGroupAccess =
            ledgerGroupRepository
                .getByMemberAccount;

        const originalGetMembers =
            ledgerGroupSummaryRepository
                .getMembers;

        const originalGetExpenses =
            ledgerGroupSummaryRepository
                .getExpenses;

        const originalGetSplits =
            ledgerGroupSummaryRepository
                .getSplits;

        const originalGetPayments =
            ledgerGroupSummaryRepository
                .getPayments;

        const originalGetSettlements =
            ledgerGroupSummaryRepository
                .getSettlements;

        ledgerGroupMemberRepository
            .getByGroupAndAccount =
            async () => ({
                id: 1,
                group_id: 10,
                account_id: 100,
                status: "active"
            });

        ledgerGroupRepository
            .getByMemberAccount =
            async () => ({
                id: 10,
                name: "Test Group"
            });

        ledgerGroupSummaryRepository
            .getMembers =
            async () => [
                {
                    id: 1,
                    group_id: 10,
                    account_id: 100,
                    name: "A",
                    mobile: null,
                    email: null,
                    role: "owner",
                    status: "active"
                },
                {
                    id: 2,
                    group_id: 10,
                    account_id: 200,
                    name: "B",
                    mobile: null,
                    email: null,
                    role: "member",
                    status: "active"
                }
            ];

        ledgerGroupSummaryRepository
            .getExpenses =
            async () => [
                {
                    id: 1,
                    group_id: 10,
                    amount: 1500
                }
            ];

        ledgerGroupSummaryRepository
            .getSplits =
            async () => [
                {
                    expense_id: 1,
                    member_id: 1,
                    share_amount: 500
                },
                {
                    expense_id: 1,
                    member_id: 2,
                    share_amount: 500
                }
            ];

        ledgerGroupSummaryRepository
            .getPayments =
            async () => [
                {
                    expense_id: 1,
                    member_id: 1,
                    amount: 1500
                }
            ];

        ledgerGroupSummaryRepository
            .getSettlements =
            async () => [
                {
                    paid_by_member_id: 2,
                    paid_to_member_id: 1,
                    amount: 500
                }
            ];

        try {

            const summary =
                await ledgerGroupSummaryService
                    .getSummary(
                        100,
                        10
                    );

            const memberA =
                summary.members.find(
                    (member) =>
                        Number(member.member_id) === 1
                );

            const memberB =
                summary.members.find(
                    (member) =>
                        Number(member.member_id) === 2
                );

            assert.equal(
                memberA.net_balance,
                500
            );

            assert.equal(
                memberB.net_balance,
                0
            );

            assert.equal(
                summary.you_will_get,
                500
            );

            assert.equal(
                summary.you_will_pay,
                0
            );

        }
        finally {

            ledgerGroupMemberRepository
                .getByGroupAndAccount =
                originalMemberAccess;

            ledgerGroupRepository
                .getByMemberAccount =
                originalGroupAccess;

            ledgerGroupSummaryRepository
                .getMembers =
                originalGetMembers;

            ledgerGroupSummaryRepository
                .getExpenses =
                originalGetExpenses;

            ledgerGroupSummaryRepository
                .getSplits =
                originalGetSplits;

            ledgerGroupSummaryRepository
                .getPayments =
                originalGetPayments;

            ledgerGroupSummaryRepository
                .getSettlements =
                originalGetSettlements;

        }

    }
);
