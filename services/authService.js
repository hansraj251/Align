const bcrypt =
    require("bcrypt");

const jwt =
    require("jsonwebtoken");

const authRepository =
    require("../repositories/authRepository");

exports.login =
async (
    email,
    password
) => {

    const user =
        await authRepository
            .getByEmail(
                email
            );

    if (
        !user
    ) {

        throw new Error(
            "Invalid email or password"
        );

    }

    const matched =
        await bcrypt.compare(
            password.trim(),
            user.password.trim()
        );

    if (
        !matched
    ) {

        throw new Error(
            "Invalid email or password"
        );

    }

    const token =
        jwt.sign(
            {
                userId:
                    user.id,

                restaurantId:
                    user.restaurant_id,

                role:
                    user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:
                    "7d"
            }
        );

    return {

        token,

        user

    };

};

exports.userExists =
async (
    email,
    mobile
) => {

    return await authRepository
        .getByEmailOrMobile(
            email,
            mobile
        );

};
exports.existsByEmail =
async (
    email
) => {

    return await authRepository
        .existsByEmail(
            email
        );

};