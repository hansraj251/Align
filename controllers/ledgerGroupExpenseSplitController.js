const ledgerGroupExpenseSplitService =
    require("../services/ledgerGroupExpenseSplitService");

exports.getSplits =

async (

    req,

    res

) => {

    try {

        const splits =
            await ledgerGroupExpenseSplitService
                .getSplits(
                    req.alignAccountId,
                    req.params.groupId,
                    req.params.expenseId
                );

        return res.json({

            success: true,

            splits

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

exports.setSplits =

async (

    req,

    res

) => {

    try {

        const splits =
            await ledgerGroupExpenseSplitService
                .setSplits(
                    req.alignAccountId,
                    req.params.groupId,
                    req.params.expenseId,
                    req.body.split_type,
                    req.body.splits
                );

        return res.json({

            success: true,

            splits

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
