const restaurantRepository =
    require("../repositories/restaurantRepository");

module.exports = async (
    req,
    res,
    next
) => {

    try {

        const subscriptionService =
    require("../services/subscriptionService");

module.exports = async (
    req,
    res,
    next
) => {

    try {

        await subscriptionService
            .validateRestaurant(
                req.user.restaurantId
            );

        next();

    } catch (err) {

        return res.status(403).json({

            success: false,

            message: err.message

        });

    }

};

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};