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

   if (

    staff.role === "owner"

) {

    return;

}

if (

    staff.role === "manager"

) {

    const blockedPages = [

        "/admin/settings.html",

        "/admin/staff.html"

    ];

    if (

        blockedPages.includes(
            window.location.pathname
        )

    ) {

        window.location.replace(
            "/admin/dashboard.html"
        );

    }

    return;

}

if (

    staff.role === "kitchen"

) {

    if (

        !window.location.pathname.endsWith(
            "/admin/kitchen.html"
        )

    ) {

        window.location.replace(
            "/admin/kitchen.html"
        );

    }

    return;

}

if (

    staff.role === "cashier"

) {

    const allowedPages = [

        "/admin/billing.html",

        "/admin/receipt.html"

    ];

    if (

        !allowedPages.includes(
            window.location.pathname
        )

    ) {

        window.location.replace(
            "/admin/billing.html"
        );

    }

    return;

}

window.location.replace(
    "/waiter/dashboard.html"
);

})();