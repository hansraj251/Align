const bcrypt = require("bcrypt");
const db = require("../db");
exports.signup = async (req, res) => {

    const {
        restaurantName,
        ownerName,
        email,
        mobile,
        password
    } = req.body;

    if (!restaurantName || restaurantName.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Restaurant name is required"
        });
    }

    if (!ownerName || ownerName.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Owner name is required"
        });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    if (!mobile || mobile.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Mobile number is required"
        });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }

    
    db.get(
    `SELECT id FROM users WHERE email = ? OR mobile = ?`,
    [email, mobile],
    async (err, existingUser) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email or Mobile already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

console.log(hashedPassword);
db.run(
    `INSERT INTO restaurants
    (
        name,
        owner_name,
        email,
        mobile,
        status
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
        restaurantName,
        ownerName,
        email,
        mobile,
        "active"
    ],
    function (err) {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        console.log("Restaurant ID:", this.lastID);
const restaurantId = this.lastID;
db.run(
    `INSERT INTO users
    (
        restaurant_id,
        name,
        email,
        mobile,
        password,
        role,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
        restaurantId,
        ownerName,
        email,
        mobile,
        hashedPassword,
        "owner",
        "active"
    ],
    function (err) {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        return res.json({
            success: true,
            message: "Signup Successful",
            restaurantId: restaurantId,
            userId: this.lastID
        });

    }
);
       
    }
);

        

    }
);

};
exports.login = (req, res) => {

    res.json({
        success: true,
        message: "Login API Working"
    });

};