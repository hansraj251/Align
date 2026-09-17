const test = require("node:test");
const assert = require("node:assert/strict");

const ledgerGroupSettlementService =
    require("../services/ledgerGroupSettlementService");

test("getMaximumSettlement uses the lower of payer pay and receiver get", () => {

    const maximum =
        ledgerGroupSettlementService
            .getMaximumSettlement(
                2500,
                1000
            );

    assert.equal(
        maximum,
        1000
    );

});

const ledgerGroupSummaryService =
    require("../services/ledgerGroupSummaryService");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

const ledgerGroupSettlementRepository =
    require("../repositories/ledgerGroupSettlementRepository");

test("createSettlement rejects amount above payer or receiver pending balance", async () => {

    const originalGetByGroupAndAccount =
        ledgerGroupMemberRepository.getByGroupAndAccount;

    const originalGetById =
        ledgerGroupMemberRepository.getById;

    const originalGetSummary =
        ledgerGroupSummaryService.getSummary;

    const originalCreate =
        ledgerGroupSettlementRepository.create;

    let createCalled = false;

    ledgerGroupMemberRepository.getByGroupAndAccount =
        async () => ({
            id: 1,
            group_id: 10,
            account_id: 100,
            status: "active"
        });

    ledgerGroupMemberRepository.getById =
        async (memberId) => ({
            id: Number(memberId),
            group_id: 10,
            account_id: Number(memberId),
            name:
                Number(memberId) === 2
                    ? "Payer"
                    : "Receiver",
            status: "active"
        });

    ledgerGroupSummaryService.getSummary =
        async () => ({
            members: [
                {
                    member_id: 2,
                    net_balance: -2500
                },
                {
                    member_id: 3,
                    net_balance: 1000
                }
            ]
        });

    ledgerGroupSettlementRepository.create =
        async (...args) => {

            createCalled = true;

            return {
                id: 99,
                group_id: args[0],
                paid_by_member_id: args[1],
                paid_to_member_id: args[2],
                amount: args[3]
            };

        };

    try {

        await assert.rejects(
            () =>
                ledgerGroupSettlementService.createSettlement(
                    100,
                    10,
                    2,
                    3,
                    1001,
                    "2026-09-17",
                    null
                ),
            /Maximum settlement amount is 1000/
        );

        assert.equal(
            createCalled,
            false
        );

    }
    finally {

        ledgerGroupMemberRepository.getByGroupAndAccount =
            originalGetByGroupAndAccount;

        ledgerGroupMemberRepository.getById =
            originalGetById;

        ledgerGroupSummaryService.getSummary =
            originalGetSummary;

        ledgerGroupSettlementRepository.create =
            originalCreate;

    }

});

test("createSettlement allows settlement up to the lower pending balance", async () => {

    const originalGetByGroupAndAccount =
        ledgerGroupMemberRepository.getByGroupAndAccount;

    const originalGetById =
        ledgerGroupMemberRepository.getById;

    const originalGetSummary =
        ledgerGroupSummaryService.getSummary;

    const originalCreate =
        ledgerGroupSettlementRepository.create;

    let createdArgs = null;

    ledgerGroupMemberRepository.getByGroupAndAccount =
        async () => ({
            id: 1,
            group_id: 10,
            account_id: 100,
            status: "active"
        });

    ledgerGroupMemberRepository.getById =
        async (memberId) => ({
            id: Number(memberId),
            group_id: 10,
            account_id: Number(memberId),
            name:
                Number(memberId) === 2
                    ? "Payer"
                    : "Receiver",
            status: "active"
        });

    ledgerGroupSummaryService.getSummary =
        async () => ({
            members: [
                {
                    member_id: 2,
                    net_balance: -2500
                },
                {
                    member_id: 3,
                    net_balance: 1000
                }
            ]
        });

    ledgerGroupSettlementRepository.create =
        async (...args) => {

            createdArgs = args;

            return {
                id: 100,
                group_id: args[0],
                paid_by_member_id: args[1],
                paid_to_member_id: args[2],
                amount: args[3]
            };

        };

    try {

        const result =
            await ledgerGroupSettlementService.createSettlement(
                100,
                10,
                2,
                3,
                1000,
                "2026-09-17",
                null
            );

        assert.equal(
            createdArgs[3],
            1000
        );

        assert.equal(
            result.amount,
            1000
        );

    }
    finally {

        ledgerGroupMemberRepository.getByGroupAndAccount =
            originalGetByGroupAndAccount;

        ledgerGroupMemberRepository.getById =
            originalGetById;

        ledgerGroupSummaryService.getSummary =
            originalGetSummary;

        ledgerGroupSettlementRepository.create =
            originalCreate;

    }

});


test("createSettlement rejects when no pending payer or receiver balance exists", async () => {

    const originalGetByGroupAndAccount =
        ledgerGroupMemberRepository.getByGroupAndAccount;

    const originalGetById =
        ledgerGroupMemberRepository.getById;

    const originalGetSummary =
        ledgerGroupSummaryService.getSummary;

    const originalCreate =
        ledgerGroupSettlementRepository.create;

    let createCalled = false;

    ledgerGroupMemberRepository.getByGroupAndAccount =
        async () => ({
            id: 1,
            group_id: 10,
            account_id: 100,
            status: "active"
        });

    ledgerGroupMemberRepository.getById =
        async (memberId) => ({
            id: Number(memberId),
            group_id: 10,
            account_id: Number(memberId),
            name:
                Number(memberId) === 2
                    ? "Payer"
                    : "Receiver",
            status: "active"
        });

    ledgerGroupSummaryService.getSummary =
        async () => ({
            members: [
                {
                    member_id: 2,
                    net_balance: 0
                },
                {
                    member_id: 3,
                    net_balance: 0
                }
            ]
        });

    ledgerGroupSettlementRepository.create =
        async () => {
            createCalled = true;
            return {
                id: 101
            };
        };

    try {

        await assert.rejects(
            () =>
                ledgerGroupSettlementService.createSettlement(
                    100,
                    10,
                    2,
                    3,
                    100,
                    "2026-09-17",
                    null
                ),
            /No pending balance is available for this settlement/
        );

        assert.equal(
            createCalled,
            false
        );

    }
    finally {

        ledgerGroupMemberRepository.getByGroupAndAccount =
            originalGetByGroupAndAccount;

        ledgerGroupMemberRepository.getById =
            originalGetById;

        ledgerGroupSummaryService.getSummary =
            originalGetSummary;

        ledgerGroupSettlementRepository.create =
            originalCreate;

    }

});
