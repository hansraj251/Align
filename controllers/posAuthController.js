const posAuthService =
    require("../services/posAuthService");

exports.login = async (
    req,
    res
) => {

    try {

        const {

            email,
            password

        } = req.body;

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and Password are required"

            });

        }

        const result =
            await posAuthService.login(

                email,

                password

            );

        return res.json({

    success: true,

    message: "Login Successful",

    restaurant: result.restaurant,

    user: result.user,

    plan: result.plan,

    planLimit: result.planLimit

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
