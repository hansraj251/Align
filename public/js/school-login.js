const schoolReturnTo = (() => {
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
        "/school/login.html",
        "/login.html"
    ];

    return allowed.includes(value) ? value : "";
})();

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

function redirectSchoolUser(payload) {
    if (payload.role === "attendance") {
        window.location.href =
            "/school/all-classes.html";
        return;
    }

    window.location.href =
        schoolReturnTo || "/school/dashboard.html";
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
                    password
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
            payload.businessType !== "school"
        ) {
            result.textContent =
                "This is a Food Business account. Please use Food Login.";
            return;
        }

        if (!payload.schoolId) {
            result.textContent =
                "This account is not a valid School account.";
            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "school_id",
            payload.schoolId
        );

        redirectSchoolUser(payload);
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
