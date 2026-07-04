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

    StaffAuth.save(

        data.token,

        data.staff

    );
localStorage.setItem(

    "restaurantName",

    data.restaurant_name || ""

);    

    switch (data.staff.role) {

        case "owner":

        case "manager":

            window.location.href =
                "/admin/dashboard.html";

            break;

        case "waiter":

    window.location.href =
        "/waiter/dashboard.html";

    break;

        case "kitchen":

    window.location.href =
        "/kitchen/index.html";

    break;

case "cashier":

    Toast.show(
        "Cashier module under development"
    );

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