async function loadDashboard() {

    const token =
        SuperAdminAuth.token();

    if (!token) {

        location.href =
            "/super-admin/login.html";

        return;

    }

    try {

        const response =
            await fetch(
                "/api/super-admin/dashboard",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!data.success) {

           if (data.success) {

    Notify.success(
        data.message
    );

} else {

    Notify.error(
        data.message
    );

}

            return;

        }

        document.getElementById(
            "totalRestaurants"
        ).textContent =
            data.totalRestaurants;

    } catch (err) {

        console.error(err);

    }

}

loadDashboard();