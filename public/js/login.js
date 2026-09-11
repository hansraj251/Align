const loginPageReturnTo =
    new URLSearchParams(
        window.location.search
    ).get("returnTo");

if (!loginPageReturnTo) {
    Auth.redirectIfLoggedIn();
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

        if (
            event.key !== "Enter"
        ) {

            return;

        }

        event.preventDefault();

        login();

    }
);

async function login() {

    const loginId =
        document
            .getElementById(
                "loginId"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "password"
            )
            .value;

    const result =
        document.getElementById(
            "result"
        );

    result.textContent = "";

    if (
        !loginId ||
        !password
    ) {

        result.textContent =
            "Email/User ID and Password are required.";

        return;

    }

    try {

        const superAdmin =
            await API.post(
                "/api/super-admin/login",
                {
                    username:
                        loginId,
                    password
                }
            );

        if (
            superAdmin.success
        ) {

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

        const loginReturnTo =
        new URLSearchParams(
            window.location.search
        ).get("returnTo");

    let loginModule = "";

    if (loginReturnTo === "/school/login.html") {
        loginModule = "school";
    } else if (loginReturnTo === "/food/login.html") {
        loginModule = "food";
    } else if (loginReturnTo === "/property/login.html") {
        loginModule = "property";
    } else if (loginReturnTo === "/music-auth/login.html") {
        loginModule = "music";
    } else if (loginReturnTo === "/ledger/login.html") {
        loginModule = "ledger";
    }

    const loginPayload = {
        identifier:
            loginId,
        password
    };

    if (loginModule) {
        loginPayload.module = loginModule;
    }

    const data =
    await API.post(
        "/api/auth/login",
        loginPayload
    );

        if (
            !data.success
        ) {

            result.textContent =
                data.message;

            return;

        }

        localStorage.setItem(
            "token",
            data.token
        );

        const payload =
            JSON.parse(
                atob(
                    data.token
                        .split(".")[1]
                )
            );

        if (
    payload.businessType === "school"
) {

    localStorage.setItem(
        "school_id",
        payload.schoolId
    );

    if (
        payload.role === "attendance"
    ) {

        window.location.href =
    "/school/all-classes.html";
        return;

    }

    window.location.href =
        "/school/dashboard.html";

    return;

}

        if (
            loginReturnTo === "/property/login.html"
        ) {

            localStorage.setItem(
                "propertyToken",
                data.token
            );

            window.location.href =
                "/property/dashboard.html";

            return;
        }

        if (
            loginReturnTo === "/music-auth/login.html"
        ) {

            localStorage.setItem(
                "musicToken",
                data.token
            );

            localStorage.setItem(
                "musicUser",
                JSON.stringify(data.user)
            );

            window.location.href =
                "/music-index.html";

            return;
        }

        if (
            loginReturnTo === "/ledger/login.html"
        ) {

            window.location.href =
                "/ledger/index.html";

            return;
        }

        localStorage.setItem(
            "restaurant_id",
            payload.restaurantId
        );

        window.location.href =
            "/admin/subscription.html";

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
            passwordInput.type ===
            "password"
                ? "text"
                : "password";

    }
);