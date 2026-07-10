const bcrypt =
    require("bcrypt");

const jwt =
    require("jsonwebtoken");

const staffRepository =
    require("../repositories/staffRepository");

exports.login = async (
    username,
    password
) => {

    const staff =
        await staffRepository.getByUsername(
            username
        );

    if (!staff) {

        throw new Error(
            "Invalid username or password"
        );

    }

    if (
        staff.status !== "active"
    ) {

        throw new Error(
            "Staff account is inactive"
        );

    }

    const ok =
        await bcrypt.compare(

            password,

            staff.password

        );

    if (!ok) {

        throw new Error(
            "Invalid username or password"
        );

    }

    await staffRepository.updateLastLogin(
        staff.id
    );

    const token =
        jwt.sign(

            {

                staffId:
                    staff.id,

                restaurantId:
                    staff.restaurant_id,

                role:
                    staff.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "30d"

            }

        );

    return {

    success: true,

    token,

    restaurant_id: staff.restaurant_id,

    restaurant_name: staff.restaurant_name,

    staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role
    }

};

};