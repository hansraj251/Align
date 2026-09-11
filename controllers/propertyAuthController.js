const bcrypt =
    require("bcrypt");

const propertyAuthService =
    require("../services/propertyAuthService");

const otpService =
    require("../services/otpService");

exports.login =
async (
    req,
    res
) => {

    try {

        const {
            identifier,
            password
        } = req.body;

        const result =
            await propertyAuthService
                .login(
                    identifier,
                    password
                );

        return res.json({

            success: true,

            token:
                result.token,

            user:
                result.user

        });

    }
    catch (err) {

        console.error(
            "Property login error:",
            err
        );

        return res.status(401).json({

            success: false,

            message:
                err.message ||
                "Unable to login"

        });

    }

};


exports.getProfile = async (
    req,
    res
) => {

    try {

        const user =
            await propertyAuthService
                .getProfile(
                    req.propertyUserId
                );


        return res.json({

            success: true,

            user

        });

    }

    catch (err) {

        console.error(
            "Property profile error:",
            err
        );


        return res.status(404).json({

            success: false,

            message:
                err.message ||
                "Unable to load profile"

        });

    }

};


exports.updateProfile = async (
    req,
    res
) => {

    try {

        const user =
            await propertyAuthService
                .updateProfile(
                    req.propertyUserId,
                    req.body
                );


        return res.json({

            success: true,

            message:
                "Profile updated successfully.",

            user

        });

    }

    catch (err) {

        console.error(
            "Property profile update error:",
            err
        );


        return res.status(400).json({

            success: false,

            message:
                err.message ||
                "Unable to update profile"

        });

    }

};

