const subscriptionService =
    require("../services/subscriptionService");

exports.getSubscription =
async (req, res) => {

    try {

        const subscription =
            await subscriptionService
                .getSubscription(
                    req.user.restaurantId
                );

        return res.json({

            success: true,

            subscription

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};