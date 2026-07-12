const diningAreaService =
    require("../services/diningAreaService");

exports.getAll = async (req, res) => {

    try {
        console.log(

            "Restaurant ID:",

            req.user.restaurantId

        );

        const areas =
            await diningAreaService.getAll(
                req.user.restaurantId
            );
console.log(

            "Areas:",

            areas

        );
        res.json({

            success: true,

            areas

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.create = async (req, res) => {

    try {

        const result =
            await diningAreaService.create(

                req.user.restaurantId,

                req.body.name

            );

        res.json(result);

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.update = async (req, res) => {

    try {

        const result =
            await diningAreaService.update(

                req.user.restaurantId,

                req.params.id,

                req.body.name,
                req.body.card_color

            );

        res.json(result);

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.remove = async (req, res) => {

    try {

        const result =
            await diningAreaService.remove(

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