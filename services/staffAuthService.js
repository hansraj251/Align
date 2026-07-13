const bcrypt =
    require("bcrypt");

const jwt =
    require("jsonwebtoken");

const staffRepository =
    require("../repositories/staffRepository");
const staffSessionService =
    require("./staffSessionService"); 
const restaurantRepository =
    require("../repositories/restaurantRepository");    
       

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

await subscriptionService
    .validateRestaurant(
        staff.restaurant_id
    );

if (!restaurant) {

    throw new Error(
        "Restaurant not found."
    );

}

// Auto Expire

if (

    restaurant.plan_end &&

    new Date(restaurant.plan_end) <
    new Date() &&

    restaurant.subscription_status !==
    "expired"

) {

    await restaurantRepository
        .expireSubscription(
            staff.restaurant_id
        );

    restaurant.subscription_status =
        "expired";

}

// Block Login

if (
    restaurant.subscription_status ===
    "expired"
) {

    throw new Error(
        "Restaurant subscription has expired."
    );

}

if (
    restaurant.subscription_status ===
    "suspended"
) {

    throw new Error(
        "Restaurant subscription is suspended."
    );

}    

   let sessionId = null;

   

if (staff.role === "waiter" || staff.role === "device") {

    const allowed =
        await staffSessionService.canCreateWaiterSession(
            staff.restaurant_id
        );

    if (!allowed) {
        throw new Error("Maximum waiter devices limit reached.");
    }
}

await staffRepository.updateLastLogin(staff.id);

if (staff.role === "waiter" || staff.role === "device") {

    sessionId =
        await staffSessionService.createSession({
            restaurant_id: staff.restaurant_id,
            staff_id: staff.id,
            role: staff.role
        });

}    

    const token =
        jwt.sign(

            {

                staffId:
                    staff.id,

                restaurantId:
                    staff.restaurant_id,

                role:
                    staff.role,

                sessionId    

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