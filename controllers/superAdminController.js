const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const superAdminService =
    require("../services/superAdminService");


exports.login = async (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {

        return res.status(400).json({

            success: false,

            message: "Username and Password are required"

        });

    }

    try {

        const admin =
            await db.getAsync(
                `
                SELECT *
                FROM super_admin
                WHERE username = ?
                `,
                [username]
            );

        if (!admin) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password"

            });

        }

        const matched =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!matched) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password"

            });

        }

        const token =
    jwt.sign(

        {
            superAdminId:
                admin.id,

            username:
                admin.username,

            role:
                "super_admin"
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

        await db.runAsync(
            `
            UPDATE super_admin
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [admin.id]
        );

        return res.json({

            success: true,

            token,

            admin: {

                id: admin.id,

                name: admin.name,

                username: admin.username

            }

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.dashboard = async (req, res) => {

    try {

        const stats =
            await superAdminService
                .getDashboardStats();

        return res.json({

            success: true,

            ...stats

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getRestaurants = async (
    req,
    res
) => {

    try {

        const restaurants =
            await superAdminService
                .getRestaurants();

        return res.json({

            success: true,

            restaurants

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.getActiveSessions =
async (req, res) => {

    try {

        const sessions =
            await superAdminService
                .getActiveSessions(
                    req.params.restaurantId
                );

        return res.json({

            success: true,

            sessions

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.forceLogout =
async (req, res) => {

    try {

        await superAdminService
            .forceLogout(
                req.params.sessionId
            );

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
exports.getRestaurant = async (req, res) => {

    try {

        console.log("Restaurant ID:", req.params.restaurantId);

        const restaurant =
            await superAdminService
                .getRestaurantById(
                    req.params.restaurantId
                );

        console.log("Restaurant:", restaurant);

        return res.json({

            success: true,

            restaurant

        });

    } catch (err) {

        console.error("GET RESTAURANT ERROR:", err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.updateRestaurantSubscription =
async (req, res) => {

    try {

        await superAdminService
    .updateRestaurantSubscription(

        req.params.restaurantId,

        req.body.plan_id,

        req.body.subscription_status

    );

        return res.json({

            success: true,

            message:
                "Subscription updated successfully."

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};