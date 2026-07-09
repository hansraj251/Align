module.exports = (req, res, next) => {

    if (
        req.user.role !== "waiter" &&
        req.user.role !== "owner"
    ) {

        return res.status(403).json({

            success: false,

            message: "Access denied"

        });

    }

    next();

};