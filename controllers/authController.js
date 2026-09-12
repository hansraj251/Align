const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const authService =
    require("../services/authService");

const authSignupService =
    require("../services/authSignupService");

const alignAccountService =

    require("../services/alignAccountService");

const schoolOnboardingService =
    require("../services/schoolOnboardingService");
const otpService =
    require("../services/otpService");  
exports.signup = async (req, res) => {

    const {
        name,
        email,
        mobile,
        password
    } = req.body;

    const cleanName =
        String(name || "").trim();

    const cleanEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    const cleanMobile =
        String(mobile || "").trim();

    if (!cleanName) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    if (!cleanEmail) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    if (!cleanMobile) {
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

    try {

        const existingEmail =
            await alignAccountService.getByEmail(
                cleanEmail
            );

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const existingMobile =
            await alignAccountService.getByMobile(
                cleanMobile
            );

        if (existingMobile) {
            return res.status(400).json({
                success: false,
                message: "Mobile number already registered"
            });
        }

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
            email: cleanEmail,
            otp,
            purpose: "align_signup",
            businessType: null,
            restaurantName: null,
            ownerName: cleanName,
            mobile: cleanMobile,
            passwordHash: hashedPassword,
            expiresAt
        });

        await otpService.sendOtpEmail(
            cleanEmail,
            otp
        );

        return res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (err) {

        console.error(
            "Align account signup error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.login =
async (
    req,
    res
) => {

    const {
    email,
    identifier,
    password
} = req.body;

const loginIdentifier =
    identifier ||
    email;

const requestedModule =
    String(
        req.body.module || ""
    ).trim().toLowerCase();

if (
    !loginIdentifier ||
    !password
) {

    return res.status(400).json({

        success: false,

        message:
            "Email/User ID and Password are required"

    });

}

    try {

        if (
            requestedModule === "ledger"
        ) {
            const centralResult =
                await alignAccountService.loginAccount(
                    loginIdentifier,
                    password
                );

            const token =
                jwt.sign(
                    {
                        alignAccountId:
                            centralResult.account.id,
                        module:
                            "ledger"
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn:
                            "7d"
                    }
                );

            return res.json({
                success: true,
                message:
                    "Login Successful",
                token,
                user: {
                    id:
                        centralResult.account.id,
                    name:
                        centralResult.account.name,
                    email:
                        centralResult.account.email,
                    mobile:
                        centralResult.account.mobile,
                    status:
                        centralResult.account.status
                }
            });
        }

        if (
            requestedModule === "music"
        ) {
            const centralResult =
                await alignAccountService.loginAccount(
                    loginIdentifier,
                    password
                );

            const musicUserId =
                await alignAccountService.ensureMusicUser(
                    centralResult.account.id,
                    centralResult.account.name,
                    centralResult.account.email,
                    centralResult.account.mobile,
                    centralResult.account.password
                );

            const token =
                jwt.sign(
                    {
                        musicUserId,
                        alignAccountId:
                            centralResult.account.id,
                        module:
                            "music"
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn:
                            "7d"
                    }
                );

            return res.json({
                success: true,
                message:
                    "Login Successful",
                token,
                user: {
                    id:
                        musicUserId,
                    name:
                        centralResult.account.name,
                    email:
                        centralResult.account.email,
                    mobile:
                        centralResult.account.mobile,
                    status:
                        centralResult.account.status
                }
            });
        }

        if (
            requestedModule === "property"
        ) {
            const centralResult =
                await alignAccountService.loginAccount(
                    loginIdentifier,
                    password
                );

            let moduleLink =
                centralResult.moduleLinks.find(
                    (link) =>
                        link.module === "property"
                );

            if (!moduleLink) {

                const propertyUserId =
                    await alignAccountService
                        .ensurePropertyUser(
                            centralResult.account.id,
                            centralResult.account.name,
                            centralResult.account.email,
                            centralResult.account.mobile,
                            centralResult.account.password
                        );

                moduleLink = {
                    module:
                        "property",
                    module_user_id:
                        propertyUserId
                };
            }

            const propertyUser =
                await alignAccountService
                    .resolveLinkedPropertyUser(
                        moduleLink.module_user_id
                    );

            const token =
                jwt.sign(
                    {
                        propertyUserId:
                            propertyUser.id,
                        propertyRole:
                            "seller",
                        alignAccountId:
                            centralResult.account.id,
                        module:
                            "property"
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn:
                            "7d"
                    }
                );

            return res.json({
                success: true,
                message:
                    "Login Successful",
                token,
                user: {
                    id:
                        propertyUser.id,
                    name:
                        propertyUser.name,
                    email:
                        propertyUser.email,
                    mobile:
                        propertyUser.mobile,
                    status:
                        propertyUser.status
                }
            });
        }

        if (
            requestedModule === "food" ||
            requestedModule === "school"
        ) {

            const centralResult =
                await alignAccountService.loginAccount(
                    loginIdentifier,
                    password
                );

            const moduleLink =
                centralResult.moduleLinks.find(
                    (link) =>
                        link.module ===
                        requestedModule
                );

            if (!moduleLink) {

                if (requestedModule === "food") {

                    const foodUserId =
                        await alignAccountService
                            .ensureFoodUser(
                                centralResult.account.id,
                                centralResult.account.name,
                                centralResult.account.email,
                                centralResult.account.mobile,
                                centralResult.account.password
                            );

                    const linkedResult =
                        await alignAccountService
                            .resolveLinkedModuleUser(
                                "food",
                                foodUserId
                            );

                    const linkedUser =
                        linkedResult.user;

                    const token =
                        jwt.sign(
                            {
                                userId:
                                    linkedUser.id,
                                alignAccountId:
                                    centralResult.account.id,
                                restaurantId:
                                    linkedUser.restaurant_id,
                                businessType:
                                    linkedUser.business_type,
                                role:
                                    linkedUser.role,
                                module:
                                    "food"
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn:
                                    "7d"
                            }
                        );

                    return res.json({
                        success: true,
                        message:
                            "Login Successful",
                        token,
                        businessType:
                            linkedUser.business_type,
                        restaurantId:
                            linkedUser.restaurant_id ||
                            null,
                        user: {
                            id:
                                linkedUser.id,
                            name:
                                linkedUser.name,
                            email:
                                centralResult.account.email,
                            mobile:
                                centralResult.account.mobile,
                            role:
                                linkedUser.role,
                            status:
                                linkedUser.status
                        }
                    });
                }

                if (requestedModule === "school") {

                    const schoolName =
                        String(
                            centralResult.account.name || ""
                        ).trim();

                    const ownerName =
                        String(
                            centralResult.account.name || ""
                        ).trim();

                    const mobile =
                        String(
                            centralResult.account.mobile || ""
                        ).trim();

                    if (!schoolName) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Align account name is required to create the School workspace."
                        });
                    }

                    if (!mobile) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Mobile number is missing from the Align account. Please update your Align account first."
                        });
                    }

                    const schoolResult =
                        await schoolOnboardingService.createWorkspace(
                            centralResult.account.id,
                            schoolName,
                            ownerName,
                            mobile,
                            "",
                            "",
                            "",
                            "",
                            centralResult.account.password
                        );

                    const linkedResult =
                        await alignAccountService
                            .resolveLinkedModuleUser(
                                "school",
                                schoolResult.userId
                            );

                    const linkedUser =
                        linkedResult.user;

                    const token =
                        jwt.sign(
                            {
                                userId:
                                    linkedUser.id,

                                alignAccountId:
                                    centralResult.account.id,

                                schoolId:
                                    linkedUser.school_id,

                                businessType:
                                    "school",

                                role:
                                    linkedUser.role,

                                module:
                                    "school"
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn:
                                    "7d"
                            }
                        );

                    return res.json({
                        success: true,

                        message:
                            "Login Successful",

                        token,

                        businessType:
                            "school",

                        schoolId:
                            linkedUser.school_id,

                        user: {
                            id:
                                linkedUser.id,

                            name:
                                linkedUser.name,

                            email:
                                centralResult.account.email,

                            mobile:
                                centralResult.account.mobile,

                            role:
                                linkedUser.role,

                            status:
                                linkedUser.status
                        }
                    });

                }

                return res.status(403).json({

                    success: false,

                    message:
                        "This Align account is not connected to the requested product."

                });

            }

            const linkedResult =
                await alignAccountService
                    .resolveLinkedModuleUser(
                        requestedModule,
                        moduleLink.module_user_id
                    );

            const linkedUser =
                linkedResult.user;

            const token =
                jwt.sign(
                    {
                        userId:
                            linkedUser.id,

                        alignAccountId:
                            centralResult.account.id,

                        restaurantId:
                            linkedUser.restaurant_id,

                        schoolId:
                            linkedUser.school_id,

                        businessType:
                            linkedUser.business_type,

                        role:
                            linkedUser.role,

                        module:
                            requestedModule
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn:
                            "7d"
                    }
                );

            return res.json({

                success: true,

                message:
                    "Login Successful",

                token,

                businessType:
                    linkedUser.business_type,

                restaurantId:
                    linkedUser.restaurant_id ||
                    null,

                schoolId:
                    linkedUser.school_id ||
                    null,

                user: {

                    id:
                        linkedUser.id,

                    name:
                        linkedUser.name,

                    email:
                        linkedUser.email,

                    role:
                        linkedUser.role

                }

            });
        }

        const result =
    await authService.login(

        loginIdentifier,

        password

    );

        return res.json({

    success: true,

    message:
        "Login Successful",

    token:
        result.token,

    businessType:
        result.user.business_type,

    restaurantId:
        result.user.restaurant_id || null,

    schoolId:
        result.user.school_id || null,

    user: {

        id:
            result.user.id,

        name:
            result.user.name,

        email:
            result.user.email,

        role:
            result.user.role

    }

});

    }
    catch (err) {

        return res.status(401).json({

            success: false,

            message:
                err.message

        });

    }

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
                email.trim().toLowerCase(),
                otp,
                "align_signup"
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

        const existingEmail =
            await alignAccountService.getByEmail(
                otpData.email
            );

        const existingMobile =
            await alignAccountService.getByMobile(
                otpData.mobile
            );

        if (existingEmail || existingMobile) {

            await otpService.deleteOtp(
                otpData.email,
                "align_signup"
            );

            return res.status(400).json({
                success: false,
                message:
                    "Email or Mobile already registered"
            });
        }

        const account =
            await alignAccountService.createAccount(
                otpData.owner_name,
                otpData.email,
                otpData.mobile,
                otpData.password_hash
            );

        await otpService.deleteOtp(
            otpData.email,
            "align_signup"
        );

        return res.json({
            success: true,
            message:
                "Signup Successful",
            accountId:
                account.id
        });

    } catch (err) {

        console.error(
            "Align account OTP verification error:",
            err
        );

        return res.status(500).json({
            success: false,
            message:
                err.message
        });
    }
};

exports.forgotPassword =
async (
    req,
    res
) => {

    const {

        email

    } = req.body;

    if (
        !email
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Email is required"

        });

    }

    try {

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        const account =
            await alignAccountService
                .getByEmail(
                    cleanEmail
                );

        if (
            !account
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email not found"

            });

        }

        const otp =
            otpService.generateOtp();

        const expiresAt =
            otpService.generateExpiry();

        await otpService.saveOtp({

            email: cleanEmail,

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

            cleanEmail,

            otp

        );

        return res.json({

            success: true,

            message:
                "OTP sent successfully"

        });

    }
    catch (err) {

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

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

            const cleanEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();

            const account =
                await alignAccountService
                    .getByEmail(
                        cleanEmail
                    );

            if (!account) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Align account not found"
                });
            }

            await alignAccountService
                .resetPassword(
                    account.id,
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

            return res.status(500).json({

                success: false,

                message:
                    err.message

            });

        }

    };
