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

            const pricingId =
                Number(req.body.pricingId);

            if (!pricingId) {

                return res.status(400).json({

                    success: false,

                    message: "Pricing is required."

                });

            }

            const payment =
                await subscriptionService
                    .createOrder(
                        req.user.restaurantId,
                        pricingId
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
exports.webhook =
    async (req, res) => {

        try {

            await subscriptionService.processWebhook(

    req.body,

    req.headers[
        "x-razorpay-signature"
    ]

);

            return res.json({

                success: true

            });

        } catch (err) {

            console.error(err);

            return res.status(400).json({

                success: false,

                message: err.message

            });

        }

    };    