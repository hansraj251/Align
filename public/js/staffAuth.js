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

    logout() {

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