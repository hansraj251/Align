const signupReturnTo = (() => {
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
loadOtpModal();
document

    .getElementById("signupForm")

    .addEventListener("submit", async (e) => {

        e.preventDefault();

        await signup();

    });
async function signup() {

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const mobile =
        document.getElementById("mobile").value.trim();

    const password =
        document.getElementById("password").value;

    const result =
        document.getElementById("result");

    result.textContent = "";

    const data = await API.post(
        "/api/auth/signup",
        {
            name,
            email,
            mobile,
            password
        }
    );

    if (!data.success) {
        result.textContent =
            data.message;
        return;
    }

    result.classList.remove("text-red-600");

    result.classList.add("text-green-600");

    result.textContent =
        "OTP sent successfully. Please verify your email.";

    window.signupEmail =
        email;

    window.otpSuccessRedirect =
        signupReturnTo ||
        "/login.html";

    openOtpModal();
}
