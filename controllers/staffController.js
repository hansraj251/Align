const staffService =
    require("../services/staffService");

exports.createStaff = async (req, res) => {

    try {

        const result =
            await staffService.createStaff(
                req.user.restaurantId,
                req.body
            );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getStaff = async (req, res) => {

    try {

        const result =
            await staffService.getStaff(
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

exports.updateStaff = async (req, res) => {

    try {

        const result =
            await staffService.updateStaff(

                req.user.restaurantId,

                req.params.id,

                req.body

            );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.deleteStaff = async (req, res) => {

    try {

        const result =
            await staffService.deleteStaff(

                req.user.restaurantId,

                req.params.id

            );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};