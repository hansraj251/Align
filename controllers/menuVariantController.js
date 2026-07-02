const menuVariantService =
    require("../services/menuVariantService");

exports.getVariants = async (
    req,
    res
) => {

    try {

        const result =
            await menuVariantService.getVariants(

                req.params.id

            );

        res.json(result);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.replaceVariants =
async (req, res) => {

    try {

        const result =
            await menuVariantService.replaceVariants(

                req.params.id,

                req.body.variants

            );

        res.json(result);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};