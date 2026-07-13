const staffAuthService =
    require("../services/staffAuthService");
const staffSessionService =
    require("../services/staffSessionService");    

exports.login = async (req, res) => {

    try {

        const result =
            await staffAuthService.login(

                req.body.username,

                req.body.password

            );

        res.json(result);

    }

    catch (err) {

        res.status(401).json({

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