const tableService =
    require("../services/tableService");

exports.createTable = async (req, res) => {

    try {

        const result =
            await tableService.create(

                req.user.restaurantId,

                req.body

            );

        res.json(result);

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.getTables = async (req, res) => {

    try {

        const tables =
            await tableService.getAll(
                req.user.restaurantId
            );

        res.json({

            success: true,

            tables

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.deleteTable = async (req, res) => {

    try {

        const result =
            await tableService.delete(

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
exports.updateTable = async (req, res) => {

    try {

        const result =
            await tableService.update(

                req.user.restaurantId,

                req.params.id,

                req.body

            );

        res.json(result);

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};