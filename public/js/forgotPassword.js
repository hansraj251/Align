const forgotReturnTo = (() => {
    const value = new URLSearchParams(window.location.search).get("returnTo");

    if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
        return "";
    }

    const allowed = [
        "/food/login.html",
        "/school/login.html",
        "/property/login.html",
        "/music-auth/login.html",
        "/ledger/login.html",
        "/login.html"
    ];

    return allowed.includes(value) ? value : "";
})();

const email =
    document.getElementById(
        "email"
    );

const sendOtpBtn =
    document.getElementById(
        "sendOtpBtn"
    );

sendOtpBtn.addEventListener(

    "click",

    async () => {

        if (
            !email.value.trim()
        ) {

            Notify.error(
                "Email is required"
            );

            return;

        }

        sendOtpBtn.disabled =
            true;

        try {

            const response =
                await API.post(

                    "/api/auth/forgot-password",

                    {

                        email:
                            email.value.trim()

                    }

                );

            Notify.success(

                response.message

            );

            sessionStorage.setItem(

                "resetEmail",

                email.value.trim()

            );

            sessionStorage.setItem(
                "resetReturnTo",
                forgotReturnTo || "/login.html"
            );

            setTimeout(

                () => {

                    window.location.href =
                        "/admin/resetPassword.html?returnTo=" +
                        encodeURIComponent(
                            forgotReturnTo || "/login.html"
                        );

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

            sendOtpBtn.disabled =
                false;

        }

    }

);