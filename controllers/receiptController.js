const receiptService =
    require("../services/receiptService");

exports.getReceipt = async (
    req,
    res
) => {

    try {

        const result =
            await receiptService.getReceipt(
                req.user.restaurantId,
                req.params.id
            );

        res.json(result);

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};