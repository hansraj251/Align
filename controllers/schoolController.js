const jwt = require("jsonwebtoken");

const schoolService =
    require("../services/schoolService");
const schoolOnboardingService =
    require("../services/schoolOnboardingService");

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
exports.updateSchoolProfile =
async (
    req,
    res
) => {

    try {

        const school =
            await schoolService.updateProfile(
                req.user.schoolId,
                req.body
            );

        return res.json({

            success: true,

            school

        });

    }
    catch (err) {

        console.error(err);

        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};
exports.uploadSchoolLogo =
async (
    req,
    res
) => {

    try {

        if (
            !req.file
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "School logo is required"

            });

        }

        const school =
            await schoolService.updateLogo(
                req.user.schoolId,
                `/uploads/${req.file.filename}`
            );

        return res.json({

            success: true,

            school

        });

    }
    catch (err) {

        console.error(err);

        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};
exports.createWorkspace =
async (
    req,
    res
) => {
    try {

        if (
            req.user.module !== "school" ||
            req.user.onboarding !== "school" ||
            req.user.schoolId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "School onboarding session is required"
            });
        }

        const result =
            await schoolOnboardingService.createWorkspace(
                req.user.alignAccountId,
                req.body.schoolName,
                req.body.ownerName,
                req.body.mobile,
                req.body.address,
                req.body.city,
                req.body.state,
                req.body.pincode
            );

        const token =
            jwt.sign(
                {
                    userId:
                        result.userId,

                    alignAccountId:
                        req.user.alignAccountId,

                    schoolId:
                        result.schoolId,

                    businessType:
                        "school",

                    role:
                        "owner",

                    module:
                        "school"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn:
                        "7d"
                }
            );

        return res.status(201).json({
            success: true,
            message:
                "School workspace created successfully",
            token,
            schoolId:
                result.schoolId,
            schoolCode:
                result.schoolCode,
            planId:
                result.planId,
            planSlug:
                result.planSlug,
            planName:
                result.planName
        });

    }
    catch (err) {

        console.error(err);

        return res.status(400).json({
            success: false,
            message:
                err.message
        });
    }
};
