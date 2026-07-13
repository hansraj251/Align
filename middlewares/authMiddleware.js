const jwt = require("jsonwebtoken");

const staffSessionService =
    require("../services/staffSessionService");

module.exports = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token missing"
        });
    }

    const token = authHeader.split(" ")[1];

    try {console.log(
    "Authorization:",
    authHeader
);

console.log(
    "Token:",
    token
);

console.log(
    "JWT Secret:",
    process.env.JWT_SECRET
);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.sessionId) {

            const session =
                await staffSessionService.getSessionById(
                    decoded.sessionId
                );

            if (!session || !session.is_active) {

                return res.status(401).json({
                    success: false,
                    message: "Session expired"
                });

            }

        }

        req.user = decoded;

        next();

    } catch (err) {

    console.log(err);

    return res.status(401).json({
        success: false,
        message: "Invalid token"
    });

}

};