const alignAccountService =
    require("../services/alignAccountService");

module.exports =
async (
    req,
    res,
    next
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required"
            });
        }

        if (req.user.alignAccountId) {
            const result =
                await alignAccountService
                    .getAccount(
                        req.user.alignAccountId
                    );

            const account =
                result.account;

            if (!account) {
                throw new Error(
                    "Align account not found"
                );
            }

            if (account.status !== "active") {
                throw new Error(
                    "Align account is not active"
                );
            }

            req.alignAccount =
                account;

            req.alignAccountId =
                account.id;

            next();
            return;
        }

        let moduleName;
        let moduleUserId;

        if (req.user.userId) {
            if (
                req.user.businessType ===
                "school"
            ) {
                moduleName = "school";
            } else {
                moduleName = "food";
            }

            moduleUserId =
                req.user.userId;
        } else if (
            req.user.propertyUserId
        ) {
            moduleName = "property";
            moduleUserId =
                req.user.propertyUserId;
        } else {
            return res.status(401).json({
                success: false,
                message:
                    "Align account identity not found"
            });
        }

        const account =
            await alignAccountService
                .resolveModuleAccount(
                    moduleName,
                    moduleUserId
                );

        req.alignAccount =
            account;

        req.alignAccountId =
            account.id;

        next();
    } catch (err) {
        console.error(
            "Align account middleware error:",
            err.message
        );

        return res.status(401).json({
            success: false,
            message:
                err.message
        });
    }
};
