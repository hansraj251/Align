Auth.redirectIfLoggedIn();

document

    .getElementById("signupForm")

    .addEventListener("submit", async (e) => {

        e.preventDefault();

        await signup();

    });

async function signup() {

    const restaurantName =
        document.getElementById("restaurantName").value.trim();

    const ownerName =
        document.getElementById("ownerName").value.trim();

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
            restaurantName,
            ownerName,
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
        "Account created successfully. Redirecting to login...";

    setTimeout(() => {

        window.location.href =
            "/admin/login.html";

    }, 1500);

}
