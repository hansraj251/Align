Auth.redirectIfLoggedIn();

document
    .getElementById("loginBtn")
    .addEventListener("click", login);

async function login() {

    const loginId = document
        .getElementById("loginId")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const result = document.getElementById("result");

    result.textContent = "";

    // Try Super Admin Login first
if (!loginId || !password) {

        result.textContent =
            "Username/Email and Password are required.";

        return;

    }  
    
    try {
const superAdmin =
    await API.post(
        "/api/super-admin/login",
        {
            username: loginId,
            password
        }
    );

if (superAdmin.success) {

    localStorage.setItem(
        "superAdminToken",
        superAdmin.token
    );

    localStorage.setItem(
        "superAdmin",
        JSON.stringify(
            superAdmin.admin
        )
    );

    window.location.href =
        "/super-admin/dashboard.html";

    return;

}

    let data;

    if (loginId.includes("@")) {

        // Owner / Admin Login

        data = await API.post(
            "/api/auth/login",
            {
                email: loginId,
                password
            }
        );
        

        if (!data.success) {

            result.textContent = data.message;

            return;

        }

        localStorage.setItem(
            "token",
            data.token
        );
        const payload = JSON.parse(
    atob(data.token.split(".")[1])
);

localStorage.setItem(
    "restaurant_id",
    payload.restaurantId
);

        window.location.href =
            "/admin/dashboard.html";

    } else {

        // Staff Login

        data = await API.post(
            "/api/staff-auth/login",
            {
                username: loginId,
                password
            }
        );
        

        if (!data.success) {

            result.textContent = data.message;

            return;

        }

        localStorage.setItem(
            "staffToken",
            data.token
        );


localStorage.setItem(
    "restaurant_id",
    data.restaurant_id
);


localStorage.setItem(
    "staff",
    JSON.stringify(data.staff)
);

        localStorage.setItem(
            "restaurantName",
            data.restaurant_name || ""
        );
        

        switch (data.staff.role) {

            case "owner":
            case "manager":
                window.location.href = "/admin/dashboard.html";
                break;

            case "waiter":
            case "device":

    window.location.href =
        "/waiter/dashboard.html";

    break;

            case "kitchen":
                window.location.href = "/admin/kitchen.html";
                break;

            case "cashier":
                window.location.href = "/cashier/dashboard.html";
                break;

            default:
                result.textContent = "Unknown role";
        }
        

    }

} catch (err) {

        console.error(err);

        result.textContent =
            "Unable to connect to server.";

    }

}