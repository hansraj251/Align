const API = {

    getToken() {
        return localStorage.getItem("token");
    },

    async request(url, options = {}) {

        const headers = {
            ...(options.headers || {})
        };

        const token = this.getToken();

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (
            options.body &&
            !headers["Content-Type"]
        ) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        return response.json();

    },

    async get(url) {

        return this.request(url);

    },

    async post(url, data) {

        return this.request(url, {

            method: "POST",

            body: JSON.stringify(data)

        });

    },

    async put(url, data) {

        return this.request(url, {

            method: "PUT",

            body: JSON.stringify(data)

        });

    },
    async patch(url, data) {

    return this.request(url, {

        method: "PATCH",

        body: JSON.stringify(data)

        });

    },

    async delete(url) {

        return this.request(url, {

            method: "DELETE"

        });

    }
    

};
