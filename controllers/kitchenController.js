const kitchenService =
    require("../services/kitchenService");
const service =
    require("../services/kitchenService");
exports.getKitchenOrders = async (
    req,
    res
) => {

    try {

        const result =
            await kitchenService.getKitchenTickets(
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
exports.updateTicketStatus = async (
    req,
    res
) => {

    try {

        const result =
            await kitchenService.updateTicketStatus(

                req.params.ticketId,

                req.body.status

            );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.updateTicketItemStatus = async (
    req,
    res
) => {

    try {

        const result =
            await service.updateTicketItemStatus(

                req.params.itemId,

                req.body.status

            );

        res.json(result);

    }

    catch (err) {

        console.error(err);

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.cancelTicketItem = async (
    req,
    res
) => {

    try {

        const result =
            await service.cancelTicketItem(
                req.params.itemId
            );

        res.json(result);

    }

    catch (err) {

        console.error(err);

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};