const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
        // return res.json({
        //     success: true,
        //     message: "Restaurant Created",
        //     restaurantId: this.lastID
        // });
        

    }
);

        

    }
);

};
exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }

    db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        async (err, user) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
            const passwordMatched = await bcrypt.compare(
    password,
    user.password
);

if (!passwordMatched) {
    return res.status(401).json({
        success: false,
        message: "Invalid email or password"
    });
}

            const token = jwt.sign(
    {
        userId: user.id,
        restaurantId: user.restaurant_id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

return res.json({
    success: true,
    message: "Login Successful",
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});

        }
    );

};