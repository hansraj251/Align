const db = require("../db");
const orderService =

    require("../services/orderService");
    console.log(">>> CHECKOUT CONTROLLER HIT");
exports.checkout = async (req, res) => {

    try {

        const result =
    await orderService.checkout(
        req.user.restaurantId,
        req.body,
        req.user.staffId
    );

        return res.json(result);

    } catch (err) {
 console.error(err);
        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};