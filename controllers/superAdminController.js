const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const superAdminService =
    require("../services/superAdminService");

exports.getDashboardStats =
async () => {

    return await
        superAdminRepository
            .getDashboardStats();

};

exports.getRestaurants =
async () => {

    return await
        superAdminRepository
            .getRestaurants();

};

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
                    superAdminId: admin.id,
                    username: admin.username
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