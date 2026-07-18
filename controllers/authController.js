const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db =
    require("../db");
const defaultSetupService =
require("../services/defaultSetupService");

const authSignupService =
    require("../services/authSignupService");      
const otpService =
    require("../services/otpService");  
const passwordResetService =
    require("../services/passwordResetService");      
exports.signup = async (req, res) => {

    const {
        restaurantName,
        ownerName,
        email,
        mobile,
        password
    } = req.body;

    if (!restaurantName || restaurantName.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Restaurant name is required"
        });
    }

    if (!ownerName || ownerName.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Owner name is required"
        });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    if (!mobile || mobile.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Mobile number is required"
        });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }

    
    db.get(
    `SELECT id FROM users WHERE email = ? OR mobile = ?`,
    [email, mobile],
    async (err, existingUser) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email or Mobile already registered"
            });
        }
       

try {

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    const otp =
        otpService.generateOtp();

    const expiresAt =
        otpService.generateExpiry();

    await otpService.saveOtp({

    email,
    otp,

    purpose: "signup",

    restaurantName,
    ownerName,
    mobile,
    passwordHash: hashedPassword,
    expiresAt

});

    await otpService.sendOtpEmail(
        email,
        otp
    );

    return res.json({

        success: true,

        message:
            "OTP sent successfully"

    });

}
catch (err) {

    console.error(err);

    return res.status(500).json({

        success: false,

        message:
            err.message

    });

}

    }
);

};
exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }

    db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        async (err, user) => {
            try {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

const passwordMatched = await bcrypt.compare(
    password.trim(),
    user.password.trim()
);


if (!passwordMatched) {
    return res.status(401).json({
        success: false,
        message: "Invalid email or password"
    });
}
await defaultSetupService.ensureDefaultTakeAway(
    user.restaurant_id
);

            const token = jwt.sign(
    {
        userId: user.id,
        restaurantId: user.restaurant_id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

return res.json({
    success: true,
    message: "Login Successful",
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});
        } catch (err) {

            console.error(err);

            return res.status(403).json({

                success: false,

                message: err.message

            });

        }

        }
    );

};
exports.verifyOtp =
    async (
        req,
        res
    ) => {
     try {    
        const {

    email,

    otp

} = req.body;
if (!email || !otp) {

    return res.status(400).json({

        success: false,

        message:
            "Email and OTP are required"

    });

}
const verificationResult =
    await otpService.verifyOtp(

        email,

        otp,

        "signup"

    );

if (!verificationResult.success) {

    return res.status(400).json({

        success: false,

        message:
            verificationResult.message

    });

}
const otpData =
    verificationResult.data;

const result =
    await authSignupService.createRestaurantAccount({

        restaurantName:
            otpData.restaurant_name,

        ownerName:
            otpData.owner_name,

        email:
            otpData.email,

        mobile:
            otpData.mobile,

        passwordHash:
            otpData.password_hash

    });

try {

    await otpService.deleteOtp(

    otpData.email,

    "signup"

);

}
catch (err) {

    console.error(

        "Failed to delete OTP:",

        err

    );

}

return res.json({

    success: true,

    message:
        "Signup Successful",

    restaurantId:
        result.restaurantId,

    userId:
        result.userId

});

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
exports.forgotPassword = async (req, res) => {

    const {
        email
    } = req.body;

    if (!email) {

        return res.status(400).json({

            success: false,

            message:
                "Email is required"

        });

    }

    db.get(

        `
        SELECT *
        FROM users
        WHERE email = ?
        `,

        [
            email
        ],

        async (
            err,
            user
        ) => {

            if (err) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error"

                });

            }

            if (!user) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email not found"

                });

            }

            try {

                const otp =
                    otpService.generateOtp();

                const expiresAt =
                    otpService.generateExpiry();

                await otpService.saveOtp({

                    email,

                    otp,

                    purpose:
                        "reset_password",

                    restaurantName:
                        null,

                    ownerName:
                        null,

                    mobile:
                        null,

                    passwordHash:
                        null,

                    expiresAt

                });

                await otpService.sendOtpEmail(

                    email,

                    otp

                );

                return res.json({

                    success: true,

                    message:
                        "OTP sent successfully"

                });

            }
            catch (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        err.message

                });

            }

        }

    );

};

exports.resetPassword =
    async (
        req,
        res
    ) => {

        try {

            const {

                email,

                otp,

                password

            } = req.body;

            if (
                !email ||
                !otp ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email, OTP and Password are required"

                });

            }

            const verificationResult =
                await otpService.verifyOtp(

                    email,

                    otp,

                    "reset_password"

                );

            if (
                !verificationResult.success
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        verificationResult.message

                });

            }

            await passwordResetService.resetPassword(

                email,

                password

            );

            await otpService.deleteOtp(

                email,

                "reset_password"

            );

            return res.json({

                success: true,

                message:
                    "Password reset successfully"

            });

        }
        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message:
                    err.message

            });

        }

    };