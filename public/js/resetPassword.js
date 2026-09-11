const resetReturnTo = (() => {
    const fromUrl =
        new URLSearchParams(window.location.search).get("returnTo");

    const fromStorage =
        sessionStorage.getItem("resetReturnTo");

    const value = fromUrl || fromStorage || "";

    if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
        return "/login.html";
    }

    const allowed = [
        "/food/login.html",
        "/school/login.html",
        "/property/login.html",
        "/music-auth/login.html",
        "/ledger/login.html",
        "/login.html"
    ];

    return allowed.includes(value) ? value : "/login.html";
})();

const otp =
    document.getElementById(
        "otp"
    );

const password =
    document.getElementById(
        "password"
    );

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );

const resetPasswordBtn =
    document.getElementById(
        "resetPasswordBtn"
    );

const email =
    sessionStorage.getItem(
        "resetEmail"
    );

if (!email) {

    window.location.href =
        "/admin/forgotPassword.html";

}

resetPasswordBtn.addEventListener(

    "click",

    async () => {

        if (
            !otp.value.trim()
        ) {

            Notify.error(
                "OTP is required"
            );

            return;

        }

        if (
            password.value.length < 8
        ) {

            Notify.error(
                "Password must be at least 8 characters"
            );

            return;

        }

        if (
            password.value !==
            confirmPassword.value
        ) {

            Notify.error(
                "Passwords do not match"
            );

            return;

        }

        resetPasswordBtn.disabled =
            true;

        try {

            const response =
                await API.post(

                    "/api/auth/reset-password",

                    {

                        email,

                        otp:
                            otp.value.trim(),

                        password:
                            password.value

                    }

                );

            Notify.success(
                response.message
            );

            sessionStorage.removeItem(
                "resetEmail"
            );

            sessionStorage.removeItem(
                "resetReturnTo"
            );

            setTimeout(

                () => {

                    window.location.href =
                        resetReturnTo;

                },

                1000

            );

        }
        catch (err) {

            Notify.error(
                err.message
            );

        }
        finally {

            resetPasswordBtn.disabled =
                false;

        }

    }

);