const test = require("node:test");
const assert = require("node:assert/strict");

const ledgerBusinessRepository =
    require("../repositories/ledgerBusinessRepository");

const ledgerBusinessService =
    require("../services/ledgerBusinessService");

test("ensureLedgerBusiness creates a business when the account has none", async () => {
    const originalGetByAccountId =
        ledgerBusinessRepository.getByAccountId;

    const originalCreate =
        ledgerBusinessRepository.create;

    let createdArgs = null;

    ledgerBusinessRepository.getByAccountId =
        async () => null;

    ledgerBusinessRepository.create =
        async (...args) => {
            createdArgs = args;

            return {
                id: 1,
                account_id: args[0],
                business_name: args[1],
                mobile: args[2],
                address: args[3],
                currency: args[4],
                status: "active"
            };
        };

    try {
        assert.equal(
            typeof ledgerBusinessService.ensureLedgerBusiness,
            "function"
        );

        const business =
            await ledgerBusinessService.ensureLedgerBusiness({
                id: 42,
                name: "Test Business",
                mobile: "9876543210"
            });

        assert.equal(
            business.account_id,
            42
        );

        assert.equal(
            business.business_name,
            "Test Business"
        );

        assert.deepEqual(
            createdArgs,
            [
                42,
                "Test Business",
                "9876543210",
                null,
                "INR"
            ]
        );
    } finally {
        ledgerBusinessRepository.getByAccountId =
            originalGetByAccountId;

        ledgerBusinessRepository.create =
            originalCreate;
    }
});

test("ensureLedgerBusiness returns an existing active business without creating another", async () => {
    const originalGetByAccountId =
        ledgerBusinessRepository.getByAccountId;

    const originalCreate =
        ledgerBusinessRepository.create;

    let createCalled = false;

    const existingBusiness = {
        id: 9,
        account_id: 42,
        business_name: "Existing Business",
        mobile: "9876543210",
        address: null,
        currency: "INR",
        status: "active"
    };

    ledgerBusinessRepository.getByAccountId =
        async () => existingBusiness;

    ledgerBusinessRepository.create =
        async () => {
            createCalled = true;
            throw new Error("create should not be called");
        };

    try {
        const business =
            await ledgerBusinessService.ensureLedgerBusiness({
                id: 42,
                name: "Account Name",
                mobile: "9876543210"
            });

        assert.deepEqual(
            business,
            existingBusiness
        );

        assert.equal(
            createCalled,
            false
        );
    } finally {
        ledgerBusinessRepository.getByAccountId =
            originalGetByAccountId;

        ledgerBusinessRepository.create =
            originalCreate;
    }
});
