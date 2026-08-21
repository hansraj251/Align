const schoolService =
    require("../services/schoolService");

exports.getSchool =
async (
    req,
    res
) => {

    try {

        const school =
            await schoolService.getSchool(
                req.user.schoolId
            );

        return res.json({

            success: true,

            school

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
