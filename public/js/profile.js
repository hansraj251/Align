Auth.requireLogin();

const staff =
    JSON.parse(
        localStorage.getItem("staff") || "{}"
    );

document.getElementById("staffName").textContent =
    staff.name || "-";

document.getElementById("staffRole").textContent =
    staff.role || "-";

document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        Auth.logout();

    });