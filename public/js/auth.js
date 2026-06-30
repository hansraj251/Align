const Auth = {

    requireLogin() {

        const token =
            localStorage.getItem("token");

        if (!token) {

            window.location.href =
                "/admin/login.html";

            return false;

        }

        return true;

    },

    logout() {

    localStorage.removeItem("token");

    sessionStorage.clear();

    window.location.replace(
        "/admin/login.html"
    );

},

    isLoggedIn() {

        return !!localStorage.getItem("token");

    },

    redirectIfLoggedIn() {

        if (this.isLoggedIn()) {

            window.location.href =
                "/admin/dashboard.html";

        }

    }

};