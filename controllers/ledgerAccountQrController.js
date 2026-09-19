const ledgerAccountQrService =

    require("../services/ledgerAccountQrService");

exports.getQrToken =

async (

    req,

    res

) => {

    try {

        const token =

            await ledgerAccountQrService

                .createToken(

                    req.alignAccountId

                );

        return res.json({

            success: true,

            token

        });

    }

    catch (err) {

        return res.status(400).json({

            success: false,

            message:

                err.message

        });

    }

};

exports.resolveQrToken =

async (

    req,

    res

) => {

    try {

        const account =

            await ledgerAccountQrService

                .resolveToken(

                    req.body.token

                );

        return res.json({

            success: true,

            account: {

                id:

                    account.id,

                name:

                    account.name,

                email:

                    account.email,

                mobile:

                    account.mobile

            }

        });

    }

    catch (err) {

        return res.status(400).json({

            success: false,

            message:

                err.message

        });

    }

};
