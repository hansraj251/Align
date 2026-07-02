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

    switch (data.staff.role) {

        case "owner":

        case "manager":

            window.location.href =
                "/admin/dashboard.html";

            break;

        case "waiter":

    window.location.href =

        "/admin/dashboard.html";

    break;

        case "kitchen":

    window.location.href =

        "/admin/dashboard.html";

    break;

case "cashier":

    window.location.href =

        "/admin/dashboard.html";

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