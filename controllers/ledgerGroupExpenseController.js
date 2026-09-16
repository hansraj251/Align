const ledgerGroupExpenseService =

    require("../services/ledgerGroupExpenseService");

exports.getExpenses =

async (

    req,

    res

) => {

    try {

        const expenses =

            await ledgerGroupExpenseService

                .getExpenses(

                    req.alignAccountId,

                    req.params.groupId

                );

        return res.json({

            success: true,

            expenses

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

exports.getExpense =

async (

    req,

    res

) => {

    try {

        const expense =

            await ledgerGroupExpenseService

                .getExpense(

                    req.alignAccountId,

                    req.params.groupId,

                    req.params.id

                );

        return res.json({

            success: true,

            expense

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

exports.createExpense =

async (

    req,

    res

) => {

    try {

        const expense =

            await ledgerGroupExpenseService

                .createExpense(

                    req.alignAccountId,

                    req.params.groupId,

                    req.body.description,

                    req.body.amount,

                    req.body.expense_date,

                    req.body.split_type,

                    req.body.notes

                );

        return res.status(201).json({

            success: true,

            expense

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

exports.updateExpense =

async (

    req,

    res

) => {

    try {

        const expense =

            await ledgerGroupExpenseService

                .updateExpense(

                    req.alignAccountId,

                    req.params.groupId,

                    req.params.id,

                    req.body.description,

                    req.body.amount,

                    req.body.expense_date,

                    req.body.split_type,

                    req.body.notes

                );

        return res.json({

            success: true,

            expense

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

exports.deleteExpense =

async (

    req,

    res

) => {

    try {

        await ledgerGroupExpenseService

            .deleteExpense(

                req.alignAccountId,

                req.params.groupId,

                req.params.id

            );

        return res.json({

            success: true,

            message:

                "Group expense deleted successfully"

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
