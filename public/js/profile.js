StaffAuth.requireLogin();

const staff =
    StaffAuth.staff();

document.getElementById(
    "staffName"
).textContent =
    staff.name;

document.getElementById(
    "staffRole"
).textContent =
    staff.role;

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

            StaffAuth.logout();

        }
    );