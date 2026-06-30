Auth.redirectIfLoggedIn();

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", login);

async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const result =
        document.getElementById("result");

    result.textContent = "";

    if (!email || !password) {

        result.textContent =
            "Email and Password are required.";

        return;

    }

    const data = await API.post(
    "/api/auth/login",
    {
        email,
        password
    }
);

    if (!data.success) {

        result.textContent =
            data.message;

        return;

    }

    localStorage.setItem(
        "token",
        data.token
    );

    window.location.href =
        "/admin/dashboard.html";

}