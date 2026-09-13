const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const vm = require("vm");

test("common login without returnTo does not authenticate a business account", async () => {
    const loginSource =
        fs.readFileSync(
            require.resolve("../public/js/login.js"),
            "utf8"
        );

    let apiAuthLoginCalled = false;

    const elements = {
        loginBtn: {
            addEventListener() {}
        },
        loginId: {
            value: "business@example.com"
        },
        password: {
            value: "password123"
        },
        result: {
            textContent: ""
        },
        togglePassword: {
            addEventListener() {}
        }
    };

    const context = {
        console: {
            error() {}
        },
        window: {
            location: {
                search: "",
                href: ""
            }
        },
        URLSearchParams,
        Auth: {
            redirectIfLoggedIn() {}
        },
        API: {
            async post(path) {
                if (path === "/api/super-admin/login") {
                    return {
                        success: false
                    };
                }

                if (path === "/api/auth/login") {
                    apiAuthLoginCalled = true;
                }

                return {
                    success: true,
                    token: "unused"
                };
            }
        },
        document: {
            getElementById(id) {
                return elements[id];
            },
            addEventListener() {}
        },
        localStorage: {
            setItem() {},
            getItem() {
                return null;
            },
            removeItem() {}
        }
    };

    vm.runInNewContext(
        loginSource,
        context
    );

    await context.login();

    assert.equal(
        apiAuthLoginCalled,
        false,
        "common login must not call business authentication when returnTo is absent"
    );
});
