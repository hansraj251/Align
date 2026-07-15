const subscriptionRequestService =
    require("../services/subscriptionRequestService");

exports.createUpgradeRequest =
    async (
        req,
        res
    ) =>
{

    try {

        const result =
            await subscriptionRequestService
                .createUpgradeRequest(
                    req.user.restaurantId,
                    req.body.requested_plan_id
                );

        res.json(
            result
        );

    } catch (error) {

        res
            .status(400)
            .json({

                success: false,

                message:
                    error.message

            });

    }

};
exports.approveRequest =
    async (
        req,
        res
    ) =>
{

    try {

        const result =
            await subscriptionRequestService
                .approveRequest(

                    req.params.id,

                    req.user.userId,

                    req.body.days

                );

        return res.json(
            result
        );

    } catch (err) {

        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};