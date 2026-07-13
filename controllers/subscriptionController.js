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
exports.createOrder =
    async (req, res) => {

        try {

            const {
                planId
            } = req.body;

            const payment =
    await subscriptionService
        .createOrder(
            req.user.restaurantId,
            req.body.planId
        );

return res.json({

    success: true,

    ...payment

});

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: err.message

            });

        }

    };
exports.verifyPayment =
    async (req, res) => {

        try {

            const result =
                await subscriptionService
                    .verifyPayment(
                        req.user.restaurantId,
                        req.body
                    );

            return res.json({

                success: true,

                data: result

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: err.message

            });

        }

    };    
exports.getPlans =
    async (req, res) => {

        try {

            const plans =
                await subscriptionService
                    .getPlans();

            return res.json({

                success: true,

                plans

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: err.message

            });

        }

    };    