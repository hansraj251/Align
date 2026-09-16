const ledgerGroupSummaryService =

    require("../services/ledgerGroupSummaryService");

async function getSummary(

    req,

    res

) {

    try {

        const summary =

            await ledgerGroupSummaryService

                .getSummary(

                    req.alignAccountId,

                    req.params.groupId

                );

        return res.status(200).json({

            success: true,

            summary

        });

    } catch (error) {

        const statusCode =

            error.message === "Group not found"

                ? 404

                : 400;

        return res.status(statusCode).json({

            success: false,

            message: error.message

        });

    }

}

module.exports = {

    getSummary

};
