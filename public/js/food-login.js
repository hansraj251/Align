const foodReturnTo = (() => {
    const value =
        new URLSearchParams(window.location.search).get("returnTo");

    if (!value) {
        return "";
    }

    if (!value.startsWith("/")) {
        return "";
    }

    if (value.startsWith("//")) {
        return "";
    }

    if (value.includes("://")) {
        return "";
    }

    const allowed = [
        "/food/login.html",
        "/login.html"
    ];

    return allowed.includes(value) ? value : "";
})();

function redirectFoodUser() {
    window.location.href =
        foodReturnTo || "/admin/subscription.html";
}

function decodeToken(token) {
    try {
        return JSON.parse(
            atob(
                token
                    .split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );
    } catch (err) {
        return null;
    }
}

document
    .getElementById("loginBtn")
    .addEventListener(
        "click",
        login
    );

document.addEventListener(
    "keydown",
    (event) => {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        login();
    }
);

async function login() {
    const loginId =
        document
            .getElementById("loginId")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    const result =
        document.getElementById("result");

    result.textContent = "";

    if (!loginId || !password) {
        result.textContent =
            "Email/User ID and Password are required.";
        return;
    }

    try {
        const data =
            await API.post(
                "/api/auth/login",
                {
                    identifier: loginId,
                    password,
                    module: "food"
                }
            );

        if (!data.success) {
            result.textContent =
                data.message;
            return;
        }

        const payload =
            decodeToken(data.token);

        if (!payload) {
            result.textContent =
                "Invalid login response.";
            return;
        }

        if (
            payload.businessType === "school"
        ) {
            result.textContent =
                "This is a School account. Please use School Login.";
            return;
        }

        if (!payload.restaurantId) {
            result.textContent =
                "This account is not a valid Food Business account.";
            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "restaurant_id",
            payload.restaurantId
        );

        redirectFoodUser();
    }
    catch (err) {
        console.error(err);

        result.textContent =
            "Unable to connect to server.";
    }
}

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

togglePassword.addEventListener(
    "click",
    () => {
        passwordInput.type =
            passwordInput.type === "password"
                ? "text"
                : "password";
    }
);
