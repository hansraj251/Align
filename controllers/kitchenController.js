const kitchenService =
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
            await kitchenService.updateTicketItemStatus(

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
            await kitchenService.cancelTicketItem(
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
exports.closeCancelledTicket = async (
    req,
    res
) => {

    try {

        const result =
            await kitchenService.closeCancelledTicket(
                req.params.ticketId
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
exports.adminCancelTicketItem = async (
    req,
    res
) => {

    try {

        const result =
            await kitchenService.adminCancelTicketItem(
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
exports.getKitchenTicket = async (
    req,
    res
) => {

    try {

        const result =
            await kitchenService.getKitchenTicket(
                req.params.ticketId,
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
exports.getTicketPrintData = async (
    req,
    res
) => {

    try {

        const ticket =
            await kitchenService.getTicketPrintData(
                req.params.ticketId
            );

        res.json({

            success: true,

            ticket

        });

    }
    catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.updateTicketItemNote = async (
    req,
    res
) => {

    try {

        const result =
            await kitchenService.updateTicketItemNote(

                req.params.itemId,

                req.body.note

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