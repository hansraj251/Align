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

    if (!loginId || !password) {

        result.textContent =
            "Username/Email and Password are required.";

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
console.log(
    "Saved restaurant_id:",
    localStorage.getItem("restaurant_id")
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
                window.location.href = "/waiter/dashboard.html";
                break;

            case "kitchen":
                window.location.href = "/kitchen/index.html";
                break;

            case "cashier":
                window.location.href = "/cashier/dashboard.html";
                break;

            default:
                result.textContent = "Unknown role";
        }

    }

}