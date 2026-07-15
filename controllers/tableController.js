const tableService =
    require("../services/tableService");
const tableRepository =
    require("../repositories/tableRepository");    

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

exports.getTakeAwayTable = async (req, res) => {

    try {

        const table =
            await tableService.getTakeAwayTable(
                req.user.restaurantId
            );

        res.json({

            success: true,

            table

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getTable = async (
    req,
    res
) => {

    try {

        const table =
            await tableRepository.getTableDetails(

                req.user.restaurantId,

                req.params.id

            );

        if (!table) {

            return res.status(404).json({

                success: false,

                message: "Table not found."

            });

        }

        return res.json({

            success: true,

            table

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};