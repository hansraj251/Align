async function login() {

    const username =
        document
            .getElementById("username")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    if (!username || !password) {

        Toast.show(
            "Username and password are required",
            "error"
        );

        return;

    }

    const data =
        await API.post(

            "/api/staff-auth/login",

            {

                username,

                password

            }

        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }
const staffToSave = {
    ...data.staff,
    restaurant_id: data.restaurant_id,
    restaurant_name: data.restaurant_name
};

StaffAuth.save(
    data.token,
    staffToSave
);

localStorage.setItem(

    "restaurantName",

    data.restaurant_name || ""

);    alert(JSON.stringify(data));

alert("ROLE = " + data.staff.role);

alert(typeof data.staff.role);
    switch (data.staff.role) {

        case "owner":

        case "manager":

            window.location.href =
                "/admin/dashboard.html";

            break;

        case "waiter":
case "device":

    window.location.href =
        "/waiter/dashboard.html";

    break;

    

        case "kitchen":

    window.location.href =
        "/admin/kitchen.html";

    break;

case "cashier":

    // window.location.href =
    //     "/admin/billing.html";

    break;

        default:

            Toast.show(
                "Unknown role",
                "error"
            );

    }

}

document
    .getElementById("loginBtn")
    .addEventListener(
        "click",
        login
    );