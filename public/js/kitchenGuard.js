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

    if (staff.role !== "kitchen") {

        window.location.replace("/login.html");
        return;

    }

})();