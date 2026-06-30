const dashboardService =
    require("../services/dashboardService");

exports.getDashboard = async (req, res) => {

    try {

        const result =
            await dashboardService.getDashboard(
                req.user.restaurantId
            );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};