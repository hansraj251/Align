const test = require("node:test");
const assert = require("node:assert/strict");

const ledgerBusinessService =
    require("../services/ledgerBusinessService");

const ledgerPartyRepository =
    require("../repositories/ledgerPartyRepository");

const ledgerTransactionRepository =
    require("../repositories/ledgerTransactionRepository");

const ledgerTransactionService =
    require("../services/ledgerTransactionService");

test("createTransaction passes interest rate to the transaction repository", async () => {
    const originalGetBusiness =
        ledgerBusinessService.getBusiness;

    const originalGetParty =
        ledgerPartyRepository.getById;

    const originalCreate =
        ledgerTransactionRepository.create;

    let createdArgs = null;

    ledgerBusinessService.getBusiness =
        async () => ({
            id: 9,
            account_id: 42,
            business_name: "Test Business",
            status: "active"
        });

    ledgerPartyRepository.getById =
        async () => ({
            id: 1,
            business_id: 9,
            party_name: "Test Party",
            status: "active"
        });

    ledgerTransactionRepository.create =
        async (...args) => {
            createdArgs = args;
            return {
                id: 10,
                party_id: 1,
                transaction_type: "credit",
                amount: 1000,
                transaction_date: "2026-09-14",
                interest_rate: 12.5
            };
        };

    try {
        await ledgerTransactionService.createTransaction(
            42,
            1,
            {
                transactionType: "credit",
                amount: 1000,
                transactionDate: "2026-09-14",
                interestRate: 12.5,
                description: "Test transaction"
            }
        );

        assert.deepEqual(
            createdArgs,
            [
                1,
                "credit",
                1000,
                "2026-09-14",
                "Test transaction",
                null,
                null,
                12.5
            ]
        );
    } finally {
        ledgerBusinessService.getBusiness =
            originalGetBusiness;

        ledgerPartyRepository.getById =
            originalGetParty;

        ledgerTransactionRepository.create =
            originalCreate;
    }
});

test("transaction repository stores and returns interest rate", async () => {
    const result =
        await ledgerTransactionRepository.create(
            1,
            "credit",
            1000,
            "2026-09-14",
            "Repository test",
            null,
            null,
            12.5
        );

    assert.equal(
        result.interest_rate,
        12.5
    );

    await ledgerTransactionRepository.delete(
        result.id,
        1
    );
});

test("transaction repository updates and returns interest rate", async () => {
    const created =
        await ledgerTransactionRepository.create(
            1,
            "credit",
            2000,
            "2026-09-14",
            "Update test",
            null,
            null,
            5
        );

    const updated =
        await ledgerTransactionRepository.update(
            created.id,
            1,
            "debit",
            2500,
            "2026-09-14",
            "Updated transaction",
            null,
            null,
            18.75
        );

    assert.equal(
        updated.interest_rate,
        18.75
    );

    assert.equal(
        updated.transaction_type,
        "debit"
    );

    assert.equal(
        updated.amount,
        2500
    );

    await ledgerTransactionRepository.delete(
        created.id,
        1
    );
});

test("updateTransaction passes interest rate to the transaction repository", async () => {
    const originalGetBusiness =
        ledgerBusinessService.getBusiness;

    const originalGetParty =
        ledgerPartyRepository.getById;

    const originalGetTransaction =
        ledgerTransactionRepository.getById;

    const originalUpdate =
        ledgerTransactionRepository.update;

    let updatedArgs = null;

    ledgerBusinessService.getBusiness =
        async () => ({
            id: 9,
            account_id: 42,
            business_name: "Test Business",
            status: "active"
        });

    ledgerPartyRepository.getById =
        async () => ({
            id: 1,
            business_id: 9,
            party_name: "Test Party",
            status: "active"
        });

    ledgerTransactionRepository.getById =
        async () => ({
            id: 10,
            party_id: 1,
            transaction_type: "credit",
            amount: 1000,
            transaction_date: "2026-09-14",
            interest_rate: 5
        });

    ledgerTransactionRepository.update =
        async (...args) => {
            updatedArgs = args;
            return {
                id: 10,
                party_id: 1,
                transaction_type: "debit",
                amount: 1500,
                transaction_date: "2026-09-14",
                interest_rate: 18.75
            };
        };

    try {
        await ledgerTransactionService.updateTransaction(
            42,
            1,
            10,
            {
                transactionType: "debit",
                amount: 1500,
                transactionDate: "2026-09-14",
                interestRate: 18.75,
                description: "Updated transaction"
            }
        );

        assert.deepEqual(
            updatedArgs,
            [
                10,
                1,
                "debit",
                1500,
                "2026-09-14",
                "Updated transaction",
                null,
                null,
                18.75
            ]
        );
    } finally {
        ledgerBusinessService.getBusiness =
            originalGetBusiness;

        ledgerPartyRepository.getById =
            originalGetParty;

        ledgerTransactionRepository.getById =
            originalGetTransaction;

        ledgerTransactionRepository.update =
            originalUpdate;
    }
});

async function assertInvalidInterestRate(
    interestRate,
    expectedMessage
) {
    const originalGetBusiness =
        ledgerBusinessService.getBusiness;

    const originalGetParty =
        ledgerPartyRepository.getById;

    ledgerBusinessService.getBusiness =
        async () => ({
            id: 9,
            account_id: 42,
            business_name: "Test Business",
            status: "active"
        });

    ledgerPartyRepository.getById =
        async () => ({
            id: 1,
            business_id: 9,
            party_name: "Test Party",
            status: "active"
        });

    try {
        await assert.rejects(
            () =>
                ledgerTransactionService.createTransaction(
                    42,
                    1,
                    {
                        transactionType: "credit",
                        amount: 1000,
                        transactionDate: "2026-09-14",
                        interestRate,
                        description: "Invalid rate"
                    }
                ),
            {
                message: expectedMessage
            }
        );
    } finally {
        ledgerBusinessService.getBusiness =
            originalGetBusiness;

        ledgerPartyRepository.getById =
            originalGetParty;
    }
}

test("createTransaction rejects missing interest rate", async () => {
    await assertInvalidInterestRate(
        undefined,
        "Interest rate is required"
    );
});

test("createTransaction rejects negative interest rate", async () => {
    await assertInvalidInterestRate(
        -1,
        "Interest rate must be a valid non-negative rate"
    );
});

test("createTransaction rejects non-numeric interest rate", async () => {
    await assertInvalidInterestRate(
        "abc",
        "Interest rate must be a valid non-negative rate"
    );
});

test("createTransaction accepts zero interest rate", async () => {
    const originalGetBusiness =
        ledgerBusinessService.getBusiness;

    const originalGetParty =
        ledgerPartyRepository.getById;

    const originalCreate =
        ledgerTransactionRepository.create;

    let createdArgs = null;

    ledgerBusinessService.getBusiness =
        async () => ({
            id: 9,
            account_id: 42,
            business_name: "Test Business",
            status: "active"
        });

    ledgerPartyRepository.getById =
        async () => ({
            id: 1,
            business_id: 9,
            party_name: "Test Party",
            status: "active"
        });

    ledgerTransactionRepository.create =
        async (...args) => {
            createdArgs = args;
            return {
                id: 11,
                party_id: 1,
                transaction_type: "credit",
                amount: 1000,
                transaction_date: "2026-09-14",
                interest_rate: 0
            };
        };

    try {
        await ledgerTransactionService.createTransaction(
            42,
            1,
            {
                transactionType: "credit",
                amount: 1000,
                transactionDate: "2026-09-14",
                interestRate: 0,
                description: "Zero rate"
            }
        );

        assert.equal(
            createdArgs[7],
            0
        );
    } finally {
        ledgerBusinessService.getBusiness =
            originalGetBusiness;

        ledgerPartyRepository.getById =
            originalGetParty;

        ledgerTransactionRepository.create =
            originalCreate;
    }
});

test("party repository only lists active parties", async () => {
    const db = require("../db");

    const originalAllAsync = db.allAsync;
    let executedSql = "";
    let executedParams = null;

    db.allAsync = async (sql, params) => {
        executedSql = sql;
        executedParams = params;
        return [];
    };

    try {
        await ledgerPartyRepository.getByBusinessId(9);

        assert.match(
            executedSql,
            /WHERE\s+business_id\s*=\s*\?\s+AND\s+status\s*=\s*['"]active['"]/i,
            "Party list must only query active parties"
        );

        assert.deepEqual(
            executedParams,
            [9]
        );
    } finally {
        db.allAsync = originalAllAsync;
    }
});
