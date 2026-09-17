const alignAccountService =
    require("../services/alignAccountService");

exports.getProfile =
async (
    req,
    res
) => {

    try {

        const account =
            await alignAccountService
                .getAccount(
                    req.alignAccountId
                );

        return res.json({

            success: true,

            profile: {
                id: account.account.id,
                name: account.account.name,
                email: account.account.email,
                mobile: account.account.mobile
            }

        });

    }
    catch (err) {

        return res.status(404).json({

            success: false,

            message:
                err.message

        });

    }

};

exports.updateProfile =
async (
    req,
    res
) => {

    try {

        const account =
            await alignAccountService
                .updateProfile(
                    req.alignAccountId,
                    req.body.name,
                    req.body.mobile
                );

        return res.json({

            success: true,

            profile: {
                id: account.id,
                name: account.name,
                email: account.email,
                mobile: account.mobile
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
