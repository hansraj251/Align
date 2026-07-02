const staffAuthService =
    require("../services/staffAuthService");

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