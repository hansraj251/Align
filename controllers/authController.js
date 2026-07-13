const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const defaultSetupService =
require("../services/defaultSetupService");
const restaurantRepository =
    require("../repositories/restaurantRepository");
const subscriptionService =
    require("../services/subscriptionService");    
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
        console.log("Original Password:", password);

const hashedPassword = await bcrypt.hash(password, 10);

console.log("Hashed Password:", hashedPassword);


db.run(
    `INSERT INTO restaurants
(
    name,
    owner_name,
    email,
    mobile,
    status,
    plan_id,
    subscription_status,
    plan_start,
    plan_end,
    trial_used
)
VALUES
(
    ?, ?, ?, ?, ?,
    (
        SELECT id
        FROM plans
        WHERE name = 'plus'
    ),
    ?,
    DATE('now'),
    DATE('now', '+30 days'),
    ?
)`,
    [
    restaurantName,
    ownerName,
    email,
    mobile,
    "active",
    "trial",
    1
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
const restaurantCode =
    `ALN${String(restaurantId).padStart(6, "0")}`;

db.run(
    `
    UPDATE restaurants
    SET restaurant_code = ?
    WHERE id = ?
    `,
    [
        restaurantCode,
        restaurantId
    ],
    function (err) {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);
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

        const userId = this.lastID;

        db.run(
            `
            INSERT INTO restaurant_settings
            (
                restaurant_id,
                footer_message,
                cgst,
                sgst
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                restaurantId,
                "Thank You! Visit Again.",
                2.5,
                2.5
            ],
            function (err) {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });

                }
                
   defaultSetupService
    .ensureDefaultTakeAway(
        restaurantId
    )
    .then(() => {

        return res.json({

            success: true,

            message: "Signup Successful",

            restaurantId,

            userId

        });

    })
    .catch(err => {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    });

            }
        );

    }
);
    }
);

        

    }
);

};
exports.login = (req, res) => {

    const { email, password } = req.body;
console.log("Received Login:", {

    email,

    password

});
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
console.log("Login Email:", email);
console.log("User Found:", user);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
            console.log("Password Type:", typeof password);
console.log("Password Length:", password.length);
console.log("Password JSON:", JSON.stringify(password));

console.log("Hash:", user.password);

const passwordMatched = await bcrypt.compare(
    password.trim(),
    user.password.trim()
);

console.log("Password Matched:", passwordMatched);
if (!passwordMatched) {
    return res.status(401).json({
        success: false,
        message: "Invalid email or password"
    });
}
await defaultSetupService.ensureDefaultTakeAway(
    user.restaurant_id
);
await subscriptionService
    .validateRestaurant(
        user.restaurant_id
    );


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