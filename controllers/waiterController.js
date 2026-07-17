const waiterService =
    require("../services/waiterService");

exports.getReadyItems = async (
    req,
    res
) => {

    try {

        const result =
            await waiterService.getReadyItems(

                req.user.restaurantId,

                req.user.staffId,

                req.query.scope || "my"

            );

        res.json(
            result
        );

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};
exports.serveTicket = async (
    req,
    res
) => {

    try {

        const result =
            await waiterService.serveTicket(
                req.user.restaurantId,
                req.params.ticketId
            );

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};
exports.serveItem = async (
    req,
    res
) => {

    try {

        const itemId =
            Number(
                req.params.itemId
            );

        const result =
            await waiterService.serveItem(
                req.user.restaurantId,
                itemId
            );

        res.json(
            result
        );

    } catch (error) {

        console.error(
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to serve item."

        });

    }

};