const Auth = {

    requireLogin() {

        const token =
            localStorage.getItem(
                "token"
            );

        const superAdminToken =
            localStorage.getItem(
                "superAdminToken"
            );

        if (
            !token &&
            !superAdminToken
        ) {

            window.location.href =
                "/login.html";

            return false;

        }

        return true;

    },

    logout() {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "superAdminToken"
        );

        localStorage.removeItem(
            "superAdmin"
        );

        sessionStorage.clear();

        window.location.replace(
            "/login.html"
        );

    },

    isLoggedIn() {

        return !!(

            localStorage.getItem(
                "token"
            ) ||

            localStorage.getItem(
                "superAdminToken"
            )

        );

    },

    redirectIfLoggedIn() {

        if (

            localStorage.getItem(
                "superAdminToken"
            )

        ) {

            window.location.href =
                "/super-admin/dashboard.html";

            return;

        }

        if (

            localStorage.getItem(
                "token"
            )

        ) {

            window.location.href =
                "/admin/subscription.html";

        }

    }

};