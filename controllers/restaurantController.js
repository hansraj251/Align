const db = require("../db");

exports.getRestaurant = (req, res) => {

    const restaurantId = req.user.restaurantId;

    db.get(
        `SELECT
            id,
            name,
            owner_name,
            email,
            mobile,
            gst_number,
            fssai_number,
            address,
            city,
            state,
            pincode,
            logo,
            status
         FROM restaurants
         WHERE id = ?`,
        [restaurantId],
        (err, restaurant) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: "Restaurant not found"
                });
            }

            return res.json({
                success: true,
                restaurant
            });

        }
    );

};
const restaurantRepository =
    require("../repositories/restaurantRepository");

exports.updateRestaurant = async (req, res) => {

    try {

        await restaurantRepository.updateRestaurant(
            req.user.restaurantId,
            req.body
        );

        res.json({
            success: true,
            message: "Restaurant updated successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
exports.uploadLogo = async (
    req,
    res
) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Please select a logo"

            });

        }

        const restaurantRepository =
            require("../repositories/restaurantRepository");

        const logo =
            `/uploads/logos/${req.file.filename}`;

        await restaurantRepository.updateLogo(

            req.user.restaurantId,

            logo

        );

        res.json({

            success: true,

            logo

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};