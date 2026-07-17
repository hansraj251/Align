const reportService =
    require("../services/reportService");

exports.getReport = async (
    req,
    res
) => {

    try {

        const result =
            await reportService.getReport(

                req.user.restaurantId,

                req.query.type,

                req.query.from,

                req.query.to

            );

        res.json({

            success: true,

            report: result

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.downloadExcel = async (
    req,
    res
) => {

    try {

        await reportService.downloadExcel(

            req.user.restaurantId,

            req.query.from,

            req.query.to,

            res

        );

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.downloadPdf = async (
    req,
    res
) => {

    try {

        await reportService.downloadPdf(

            req.user.restaurantId,

            req.query.from,

            req.query.to,

            res

        );

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};