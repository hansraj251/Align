const staffAuthService =
    require("../services/staffAuthService");
const staffSessionService =
    require("../services/staffSessionService");    

exports.login = async (req, res) => {

    try {

        const {
    username,
    password,
    fcmToken
} = req.body;

        const result =
    await staffAuthService.login(
        username,
        password,
        fcmToken,
        {
            device_info:
                req.headers["user-agent"],

            ip_address:
                req.headers["x-forwarded-for"] ||
                req.ip
        }
    );

        return res.json(
            result
        );

    } catch (err) {

        return res.status(401).json({

            success: false,

            message: err.message

        });

    }

};

exports.logout = async (req, res) => {

    try {

        if (req.user.sessionId) {

            await staffSessionService.closeSession(
                req.user.sessionId
            );

        }

        return res.json({

            success: true

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};