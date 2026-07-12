(function () {

    const adminToken =
        localStorage.getItem("token");

    if (adminToken) {
        return;
    }

    const staffToken =
        localStorage.getItem("staffToken");

    if (!staffToken) {

        window.location.replace("/login.html");
        return;

    }

    const staff = JSON.parse(
        localStorage.getItem("staff") || "{}"
    );

    const allowedRoles = [
        "waiter",
        "device"
    ];

    if (
        !allowedRoles.includes(staff.role)
    ) {

        window.location.replace("/login.html");
        return;

    }

})();