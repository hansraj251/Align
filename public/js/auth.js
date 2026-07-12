const Auth = {

    requireLogin() {

        const adminToken = localStorage.getItem("token");
        const staffToken = localStorage.getItem("staffToken");

        if (!adminToken && !staffToken) {

            window.location.href = "/login.html";
            return false;

        }

        return true;

    },

   async logout() {

    const staffToken =
        localStorage.getItem("staffToken");

    if (staffToken) {

        try {

            await fetch("/api/staff-auth/logout", {

                method: "POST",

                headers: {

                    Authorization:
                        "Bearer " + staffToken

                }

            });

        } catch (err) {

            console.error(
                "Logout API failed:",
                err
            );

        }

    }

    localStorage.removeItem("token");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staff");
    localStorage.removeItem("restaurantName");

    sessionStorage.clear();

    window.location.replace("/login.html");

},

    isLoggedIn() {

        return !!(
            localStorage.getItem("token") ||
            localStorage.getItem("staffToken")
        );

    },

    redirectIfLoggedIn() {

        if (localStorage.getItem("token")) {

            window.location.href =
                "/admin/dashboard.html";

            return;

        }

        if (localStorage.getItem("staffToken")) {

            const staff = JSON.parse(
                localStorage.getItem("staff") || "{}"
            );

            switch (staff.role) {

                case "owner":
                case "manager":
                    window.location.href = "/admin/dashboard.html";
                    break;

                case "waiter":
case "device":

    window.location.href =
        "/waiter/dashboard.html";

    break;

                case "kitchen":
                    window.location.href = "/kitchen/index.html";
                    break;

                case "cashier":
                    window.location.href = "/cashier/dashboard.html";
                    break;
            }

        }

    }

};