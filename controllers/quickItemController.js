const quickItemService =
    require("../services/quickItemService");
exports.getAll = async (
    req,
    res
) => {

    try {

        const data =
            await quickItemService.getAll(
                req.user.restaurantId
            );

        res.json({

            success: true,

            data

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};
exports.create = async (
    req,
    res
) => {

    try {

        const result =
            await quickItemService.create(

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
exports.getById = async (
    req,
    res
) => {

    try {

        const result =
            await quickItemService.getById(

                req.user.restaurantId,

                req.params.id

            );

        res.json({

            success: true,

            data: result

        });

    } catch (err) {

        res.status(404).json({

            success: false,

            message: err.message

        });

    }

};
exports.update = async (
    req,
    res
) => {

    try {

        const result =
            await quickItemService.update(

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
exports.delete = async (
    req,
    res
) => {

    try {

        const result =
            await quickItemService.delete(

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
exports.updateActive = async (

    req,

    res

) => {

    try {

        const result =
            await quickItemService.updateActive(

                req.user.restaurantId,

                req.params.id,

                req.body.active

            );

        res.json(result);

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};
