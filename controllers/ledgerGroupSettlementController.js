const ledgerGroupSettlementService =
    require("../services/ledgerGroupSettlementService");

exports.getSettlements =

async (

    req,

    res

) => {

    try {

        const settlements =
            await ledgerGroupSettlementService
                .getSettlements(
                    req.alignAccountId,
                    req.params.groupId
                );

        return res.json({

            success: true,

            settlements

        });

    }

    catch (err) {

        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};

exports.getSettlement =

async (

    req,

    res

) => {

    try {

        const settlement =
            await ledgerGroupSettlementService
                .getSettlement(
                    req.alignAccountId,
                    req.params.groupId,
                    req.params.id
                );

        return res.json({

            success: true,

            settlement

        });

    }

    catch (err) {

        return res.status(404).json({

            success: false,

            message:
                err.message

        });

    }

};

exports.createSettlement =

async (

    req,

    res

) => {

    try {

        const settlement =
            await ledgerGroupSettlementService
                .createSettlement(
                    req.alignAccountId,
                    req.params.groupId,
                    req.body.paid_by_member_id,
                    req.body.paid_to_member_id,
                    req.body.amount,
                    req.body.settlement_date,
                    req.body.notes
                );

        return res.status(201).json({

            success: true,

            settlement

        });

    }

    catch (err) {

        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};

exports.deleteSettlement =

async (

    req,

    res

) => {

    try {

        await ledgerGroupSettlementService
            .deleteSettlement(
                req.alignAccountId,
                req.params.groupId,
                req.params.id
            );

        return res.json({

            success: true,

            message:
                "Settlement deleted successfully"

        });

    }

    catch (err) {

        return res.status(404).json({

            success: false,

            message:
                err.message

        });

    }

};
