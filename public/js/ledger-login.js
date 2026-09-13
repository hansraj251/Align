const existingLedgerToken =
    localStorage.getItem("token");

if (existingLedgerToken) {
    try {
        const payloadPart =
            existingLedgerToken.split(".")[1];

        if (!payloadPart) {
            throw new Error("Invalid token");
        }

        const normalizedPayload =
            payloadPart
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const paddedPayload =
            normalizedPayload +
            "=".repeat(
                (4 - normalizedPayload.length % 4) % 4
            );

        const existingPayload =
            JSON.parse(
                atob(paddedPayload)
            );

        if (
            existingPayload &&
            existingPayload.module === "ledger"
        ) {
            window.location.href =
                "/ledger/index.html";
        }
    } catch (error) {
        console.error(
            "Ledger session check failed:",
            error
        );
    }
}

document
    .getElementById("loginBtn")
    .addEventListener("click", login);

document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    login();
});

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
            "Email/Mobile and Password are required.";
        return;
    }

    try {
        const data = await API.post(
            "/api/auth/login",
            {
                identifier: loginId,
                password,
                module: "ledger"
            }
        );

        if (!data.success) {
            result.textContent =
                data.message || "Login failed.";
            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "lastLoginModule",
            "ledger"
        );

        localStorage.removeItem(
            "restaurant_id"
        );

        localStorage.removeItem(
            "school_id"
        );

        window.location.href =
            "/ledger/index.html";
    } catch (err) {
        console.error(err);

        result.textContent =
            "Unable to connect to server.";
    }
}

const togglePassword =
    document.getElementById("togglePassword");

const passwordInput =
    document.getElementById("password");

if (togglePassword && passwordInput) {
    togglePassword.addEventListener(
        "click",
        () => {
            passwordInput.type =
                passwordInput.type === "password"
                    ? "text"
                    : "password";
        }
    );
}
