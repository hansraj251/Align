const jwt =

    require("jsonwebtoken");

const alignAccountRepository =

    require("../repositories/alignAccountRepository");

const QR_TOKEN_TYPE =

    "ledger_account_qr";

const QR_TOKEN_EXPIRY =

    "1d";

exports.createToken =

async (

    accountId

) => {

    const account =

        await alignAccountRepository

            .getById(

                accountId

            );

    if (

        !account ||

        account.status !== "active"

    ) {

        throw new Error(

            "Align account not found"

        );

    }

    return jwt.sign(

        {

            type:

                QR_TOKEN_TYPE,

            accountId:

                account.id

        },

        process.env.JWT_SECRET,

        {

            expiresIn:

                QR_TOKEN_EXPIRY

        }

    );

};

exports.resolveToken =

async (

    token

) => {

    const decoded =

        jwt.verify(

            token,

            process.env.JWT_SECRET

        );

    if (

        decoded.type !==

        QR_TOKEN_TYPE

    ) {

        throw new Error(

            "Invalid QR code"

        );

    }

    const account =

        await alignAccountRepository

            .getById(

                decoded.accountId

            );

    if (

        !account ||

        account.status !== "active"

    ) {

        throw new Error(

            "Align account not found"

        );

    }

    return account;

};
