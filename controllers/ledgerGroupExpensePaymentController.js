const ledgerGroupExpensePaymentService =
    require("../services/ledgerGroupExpensePaymentService");

exports.getPayments =

async (

    req,

    res

) => {

    try {

        const payments =
            await ledgerGroupExpensePaymentService
                .getPayments(
                    req.alignAccountId,
                    req.params.groupId,
                    req.params.expenseId
                );

        return res.json({

            success: true,

            payments

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

exports.setPayments =

async (

    req,

    res

) => {

    try {

        const payments =
            await ledgerGroupExpensePaymentService
                .setPayments(
                    req.alignAccountId,
                    req.params.groupId,
                    req.params.expenseId,
                    req.body.payments
                );

        return res.json({

            success: true,

            payments

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
