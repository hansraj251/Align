const test = require("node:test");

const assert = require("node:assert/strict");

const ledgerGroupInvitationService =

    require("../services/ledgerGroupInvitationService");

const ledgerGroupRepository =

    require("../repositories/ledgerGroupRepository");

const alignAccountRepository =

    require("../repositories/alignAccountRepository");

const ledgerGroupMemberRepository =

    require("../repositories/ledgerGroupMemberRepository");


test("addAccountByQr adds an active account directly to the group", async () => {

    const originalGetByMemberAccount =

        ledgerGroupRepository.getByMemberAccount;

    const originalGetById =

        alignAccountRepository.getById;

    const originalGetByGroupAndAccount =

        ledgerGroupMemberRepository.getByGroupAndAccount;

    const originalCreate =

        ledgerGroupMemberRepository.create;

    let createdArgs = null;

    ledgerGroupRepository.getByMemberAccount =

        async () => ({

            id: 10,

            status: "active"

        });

    alignAccountRepository.getById =

        async () => ({

            id: 200,

            name: "QR Member",

            mobile: "9876543210",

            email: "qr@example.com",

            status: "active"

        });

    ledgerGroupMemberRepository.getByGroupAndAccount =

        async () => null;

    ledgerGroupMemberRepository.create =

        async (...args) => {

            createdArgs = args;

            return {

                id: 50,

                group_id: args[0],

                account_id: args[1],

                name: args[2],

                mobile: args[3],

                email: args[4],

                role: args[5],

                status: args[6]

            };

        };

    try {

        const result =

            await ledgerGroupInvitationService

                .addAccountByQr(

                    100,

                    10,

                    200

                );

        assert.equal(

            createdArgs[0],

            10

        );

        assert.equal(

            createdArgs[1],

            200

        );

        assert.equal(

            createdArgs[2],

            "QR Member"

        );

        assert.equal(

            createdArgs[5],

            "member"

        );

        assert.equal(

            createdArgs[6],

            "active"

        );

        assert.equal(

            result.account_id,

            200

        );

    }

    finally {

        ledgerGroupRepository.getByMemberAccount =

            originalGetByMemberAccount;

        alignAccountRepository.getById =

            originalGetById;

        ledgerGroupMemberRepository.getByGroupAndAccount =

            originalGetByGroupAndAccount;

        ledgerGroupMemberRepository.create =

            originalCreate;

    }

});


test("addAccountByQr rejects adding yourself", async () => {

    const originalGetByMemberAccount =

        ledgerGroupRepository.getByMemberAccount;

    const originalGetById =

        alignAccountRepository.getById;

    let memberLookupCalled = false;

    ledgerGroupRepository.getByMemberAccount =

        async () => ({

            id: 10,

            status: "active"

        });

    alignAccountRepository.getById =

        async () => ({

            id: 100,

            name: "Current Account",

            mobile: "9876543210",

            email: "current@example.com",

            status: "active"

        });

    const originalGetByGroupAndAccount =

        ledgerGroupMemberRepository.getByGroupAndAccount;

    ledgerGroupMemberRepository.getByGroupAndAccount =

        async () => {

            memberLookupCalled = true;

            return null;

        };

    try {

        await assert.rejects(

            () =>

                ledgerGroupInvitationService

                    .addAccountByQr(

                        100,

                        10,

                        100

                    ),

            /You cannot add yourself/

        );

        assert.equal(

            memberLookupCalled,

            false

        );

    }

    finally {

        ledgerGroupRepository.getByMemberAccount =

            originalGetByMemberAccount;

        alignAccountRepository.getById =

            originalGetById;

        ledgerGroupMemberRepository.getByGroupAndAccount =

            originalGetByGroupAndAccount;

    }

});


test("addAccountByQr rejects an existing active member", async () => {

    const originalGetByMemberAccount =

        ledgerGroupRepository.getByMemberAccount;

    const originalGetById =

        alignAccountRepository.getById;

    const originalGetByGroupAndAccount =

        ledgerGroupMemberRepository.getByGroupAndAccount;

    let createCalled = false;

    ledgerGroupRepository.getByMemberAccount =

        async () => ({

            id: 10,

            status: "active"

        });

    alignAccountRepository.getById =

        async () => ({

            id: 200,

            name: "Existing Member",

            mobile: "9876543210",

            email: "existing@example.com",

            status: "active"

        });

    ledgerGroupMemberRepository.getByGroupAndAccount =

        async () => ({

            id: 50,

            group_id: 10,

            account_id: 200,

            status: "active"

        });

    const originalCreate =

        ledgerGroupMemberRepository.create;

    ledgerGroupMemberRepository.create =

        async () => {

            createCalled = true;

            return {};

        };

    try {

        await assert.rejects(

            () =>

                ledgerGroupInvitationService

                    .addAccountByQr(

                        100,

                        10,

                        200

                    ),

            /Account is already a group member/

        );

        assert.equal(

            createCalled,

            false

        );

    }

    finally {

        ledgerGroupRepository.getByMemberAccount =

            originalGetByMemberAccount;

        alignAccountRepository.getById =

            originalGetById;

        ledgerGroupMemberRepository.getByGroupAndAccount =

            originalGetByGroupAndAccount;

        ledgerGroupMemberRepository.create =

            originalCreate;

    }

});
