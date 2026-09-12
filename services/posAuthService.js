const bcrypt = require("bcrypt");
const jwt =
    require("jsonwebtoken");
const posAuthRepository =
    require("../repositories/posAuthRepository");

const alignAccountService =

    require("./alignAccountService");

exports.login = async (

    email,
    password,
    deviceId

) => {

    const centralResult =
        await alignAccountService.loginAccount(
            email,
            password
        );

    const foodLink =
        centralResult.moduleLinks.find(
            (link) =>
                link.module === "food"
        );

    if (!foodLink) {

        throw new Error(
            "This Align account is not connected to Food."
        );

    }

    const foodUserResult =
        await alignAccountService.resolveLinkedModuleUser(
            "food",
            foodLink.module_user_id
        );

    const data =
        await posAuthRepository.getUserWithRestaurantById(
            foodUserResult.user.id
        );

    if (!data) {

        throw new Error(
            "Food account data not found."
        );

    }

    if (!data.active_device_id) {

        await posAuthRepository
            .updateActiveDeviceId(
                data.restaurant_id,
                deviceId
            );

        data.active_device_id =
            deviceId;

    } else if (
        data.active_device_id !==
        deviceId
    ) {

        const err =
            new Error(
                "This account is already active on another computer."
            );

        err.code =
            "DEVICE_CONFLICT";

        throw err;

    }

    const token =
        jwt.sign(

            {
                restaurantId:
                    data.restaurant_id,

                userId:
                    data.id,

                role:
                    data.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn:
                    "5y"
            }
        );

    return {

        token,

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

            password_hash:
                centralResult.account.password,

            role:
                data.role,

            status:
                data.status
        },

        plan: {

            id:
                data.plan_id,

            slug:
                data.plan_slug,

            display_name:
                data.display_name,

            description:
                data.plan_description,

            sort_order:
                data.sort_order,

            status:
                data.plan_status
        },

        planLimit: {

            plan_id:
                data.plan_id,

            limit_key:
                "waiter_devices",

            limit_value:
                data.allowed_devices
        }

    };

};

exports.replaceDevice = async (
    email,
    password,
    deviceId
) => {

    const data =
        await posAuthRepository
            .getUserWithRestaurantByEmail(
                email
            );

    if (
        !data
    ) {

        throw new Error(
            "Invalid email or password"
        );

    }

    const passwordMatched =
        await bcrypt.compare(
            password.trim(),
            data.password.trim()
        );

    if (
        !passwordMatched
    ) {

        throw new Error(
            "Invalid email or password"
        );

    }

    await posAuthRepository
        .replaceActiveDevice(
            data.restaurant_id,
            deviceId
        );

    return {

        success: true

    };

};