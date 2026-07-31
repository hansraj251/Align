const bcrypt = require("bcrypt");

const posAuthRepository =
    require("../repositories/posAuthRepository");

exports.login = async (
    email,
    password
) => {

    const data =
        await posAuthRepository.getUserWithRestaurantByEmail(
            email
        );

    if (!data) {

        throw new Error(
            "Invalid email or password"
        );

    }

    const passwordMatched =
        await bcrypt.compare(
            password.trim(),
            data.password.trim()
        );

    if (!passwordMatched) {

        throw new Error(
            "Invalid email or password"
        );

    }

    return {

        restaurant: {

            id:
                data.restaurant_id,

            name:
                data.restaurant_name,

            owner_name:
                data.owner_name,

            mobile:
                data.restaurant_mobile,

            email:
                data.restaurant_email,

            gst_number:
                data.gst_number,

            fssai_number:
                data.fssai_number,

            address:
                data.address,

            city:
                data.city,

            state:
                data.state,

            pincode:
                data.pincode,

            logo:
                data.logo,

            restaurant_code:
                data.restaurant_code,

            plan_id:
                data.plan_id,

            subscription_status:
                data.subscription_status,

            plan_start:
                data.plan_start,

            plan_end:
                data.plan_end,

            trial_used:
                data.trial_used,

            status:
                data.restaurant_status

        },

        user: {

            id:
                data.id,

            restaurant_id:
                data.restaurant_id,

            name:
                data.name,

            email:
                data.email,

            mobile:
                data.mobile,

            password_hash: data.password,

            role:
                data.role,

            status:
                data.status

        }

    };

};