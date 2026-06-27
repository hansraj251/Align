const paymentService =
    require("../services/paymentService");

exports.receivePayment = async (req, res) => {

    try {

        const result =
            await paymentService.receivePayment(
                req.user.restaurantId,
                req.params.id,
                req.body.payment_method
            );

        res.json(result);

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};