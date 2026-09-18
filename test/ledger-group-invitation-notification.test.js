const test = require("node:test");

const assert = require("node:assert/strict");

const ledgerGroupInvitationService =
    require("../services/ledgerGroupInvitationService");

const ledgerGroupInvitationRepository =
    require("../repositories/ledgerGroupInvitationRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

const ledgerGroupRepository =
    require("../repositories/ledgerGroupRepository");

const alignAccountRepository =
    require("../repositories/alignAccountRepository");

const ledgerNotificationService =
    require("../services/ledgerNotificationService");

test("createInvitation sends notification to invited account", async () => {

    const originalGetById =
        alignAccountRepository.getById;

    const originalGetByMemberAccount =
        ledgerGroupRepository.getByMemberAccount;

    const originalGetByEmail =
        alignAccountRepository.getByEmail;

    const originalGetByGroupAndAccount =
        ledgerGroupMemberRepository.getByGroupAndAccount;

    const originalGetPending =
        ledgerGroupInvitationRepository
            .getPendingByGroupAndAccount;

    const originalCreate =
        ledgerGroupInvitationRepository.create;

    const originalSendToAccount =
        ledgerNotificationService.sendToAccount;

    let notificationArgs = null;

    alignAccountRepository.getById =
        async () => ({
            id: 100,
            name: "Rahul",
            status: "active"
        });

    ledgerGroupRepository.getByMemberAccount =
        async () => ({
            id: 10,
            name: "Goa Trip",
            status: "active"
        });

    alignAccountRepository.getByEmail =
        async () => ({
            id: 200,
            name: "Amit",
            mobile: "9876543210",
            email: "amit@example.com",
            status: "active"
        });

    ledgerGroupMemberRepository.getByGroupAndAccount =
        async () => null;

    ledgerGroupInvitationRepository
        .getPendingByGroupAndAccount =
        async () => null;

    ledgerGroupInvitationRepository.create =
        async () => ({
            id: 50,
            group_id: 10,
            invited_by_account_id: 100,
            invited_account_id: 200,
            status: "pending"
        });

    ledgerNotificationService.sendToAccount =
        async (...args) => {
            notificationArgs = args;
        };

    try {

        const result =
            await ledgerGroupInvitationService
                .createInvitation(
                    100,
                    10,
                    "amit@example.com"
                );

        assert.equal(
            result.id,
            50
        );

        assert.equal(
            notificationArgs[0],
            200
        );

        assert.equal(
            notificationArgs[1],
            "Group Invitation"
        );

        assert.equal(
            notificationArgs[2],
            "Goa Trip - Rahul"
        );

        assert.deepEqual(
            notificationArgs[3],
            {
                type: "ledger_group_invitation",
                groupId: "10",
                invitationId: "50"
            }
        );

    }
    finally {

        alignAccountRepository.getById =
            originalGetById;

        ledgerGroupRepository.getByMemberAccount =
            originalGetByMemberAccount;

        alignAccountRepository.getByEmail =
            originalGetByEmail;

        ledgerGroupMemberRepository.getByGroupAndAccount =
            originalGetByGroupAndAccount;

        ledgerGroupInvitationRepository
            .getPendingByGroupAndAccount =
            originalGetPending;

        ledgerGroupInvitationRepository.create =
            originalCreate;

        ledgerNotificationService.sendToAccount =
            originalSendToAccount;
    }

});
