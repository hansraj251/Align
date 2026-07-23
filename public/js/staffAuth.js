const StaffAuth = {

   save(token, staff) {

    localStorage.setItem(
        "staffToken",
        token
    );

    localStorage.setItem(
        "staff",
        JSON.stringify(staff)
    );


    },

    token() {

        return localStorage.getItem(
            "staffToken"
        );

    },

    staff() {

        return JSON.parse(

            localStorage.getItem(
                "staff"
            ) || "null"

        );

    },

    async logout() {

    try {

        await API.post(
            "/api/staff-auth/logout"
        );

    } catch (err) {

        console.error(
            "Logout failed:",
            err
        );

    }

    localStorage.removeItem(
        "staffToken"
    );

    localStorage.removeItem(
        "staff"
    );

    window.location.href =
        "/login.html";

},

    requireLogin() {

        if (!this.token()) {

            window.location.href =
                "/login.html";

        }

    }

};