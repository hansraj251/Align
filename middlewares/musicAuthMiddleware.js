const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization || "";

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication token required"
            });
        }

        const token =
            authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication token required"
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        if (
            !decoded.musicUserId ||
            decoded.module !== "music"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Music account access required"
            });
        }

        req.musicUserId =
            decoded.musicUserId;

        req.alignAccountId =
            decoded.alignAccountId;

        next();
    } catch (err) {
        console.error(
            "Music auth error:",
            err.message
        );

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired authentication token"
        });
    }
};
