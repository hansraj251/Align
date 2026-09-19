const test = require("node:test");

const assert = require("node:assert/strict");

const jwt =

    require("jsonwebtoken");

const ledgerAccountQrService =

    require("../services/ledgerAccountQrService");

const alignAccountRepository =

    require("../repositories/alignAccountRepository");

test("createToken generates a QR token for an active account", async () => {

    const originalGetById =

        alignAccountRepository.getById;

    alignAccountRepository.getById =

        async () => ({

            id: 123,

            name: "QR Test Account",

            email: "qr-test@example.com",

            mobile: "9999999999",

            status: "active"

        });

    try {

        const token =

            await ledgerAccountQrService

                .createToken(

                    123

                );

        const decoded =

            jwt.verify(

                token,

                process.env.JWT_SECRET

            );

        assert.equal(

            decoded.type,

            "ledger_account_qr"

        );

        assert.equal(

            decoded.accountId,

            123

        );

    }

    finally {

        alignAccountRepository.getById =

            originalGetById;

    }

});

test("resolveToken returns the active account", async () => {

    const originalGetById =

        alignAccountRepository.getById;

    alignAccountRepository.getById =

        async () => ({

            id: 123,

            name: "QR Test Account",

            email: "qr-test@example.com",

            mobile: "9999999999",

            status: "active"

        });

    try {

        const token =

            jwt.sign(

                {

                    type:

                        "ledger_account_qr",

                    accountId:

                        123

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:

                        "30d"

                }

            );

        const account =

            await ledgerAccountQrService

                .resolveToken(

                    token

                );

        assert.equal(

            account.id,

            123

        );

        assert.equal(

            account.status,

            "active"

        );

    }

    finally {

        alignAccountRepository.getById =

            originalGetById;

    }

});

test("resolveToken rejects a token with the wrong type", async () => {

    const token =

        jwt.sign(

            {

                type:

                    "wrong_type",

                accountId:

                    123

            },

            process.env.JWT_SECRET,

            {

                expiresIn:

                    "30d"

            }

        );

    await assert.rejects(

        () =>

            ledgerAccountQrService

                .resolveToken(

                    token

                ),

        /Invalid QR code/

    );

});

test("resolveToken rejects an inactive account", async () => {

    const originalGetById =

        alignAccountRepository.getById;

    alignAccountRepository.getById =

        async () => ({

            id: 123,

            name: "Inactive Account",

            email: "inactive@example.com",

            mobile: "9999999999",

            status: "inactive"

        });

    try {

        const token =

            jwt.sign(

                {

                    type:

                        "ledger_account_qr",

                    accountId:

                        123

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:

                        "30d"

                }

            );

        await assert.rejects(

            () =>

                ledgerAccountQrService

                    .resolveToken(

                        token

                    ),

            /Align account not found/

        );

    }

    finally {

        alignAccountRepository.getById =

            originalGetById;

    }

});
