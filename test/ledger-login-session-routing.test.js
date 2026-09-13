const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const vm = require("vm");

test("Ledger login with an existing Ledger session stays in Ledger", () => {
    const source = fs.readFileSync(
        require.resolve("../public/js/ledger-login.js"),
        "utf8"
    );

    let redirectedTo = "";

    const payload = Buffer.from(
        JSON.stringify({ module: "ledger" })
    ).toString("base64url");

    const token = `header.${payload}.signature`;

    const elements = {
        loginBtn: {
            addEventListener() {}
        },
        togglePassword: null,
        password: null
    };

    const context = {
        Auth: {
            redirectIfLoggedIn() {
                redirectedTo = "/admin/subscription.html";
            }
        },
        API: {},
        localStorage: {
            getItem(key) {
                return key === "token" ? token : null;
            }
        },
        window: {
            location: {
                get href() {
                    return redirectedTo;
                },
                set href(value) {
                    redirectedTo = value;
                }
            }
        },
        document: {
            getElementById(id) {
                return elements[id] || {
                    addEventListener() {}
                };
            },
            addEventListener() {}
        },
        console: {
            error() {}
        },
        atob(value) {
            return Buffer.from(value, "base64").toString("binary");
        },
        Buffer
    };

    vm.runInNewContext(source, context);

    assert.equal(
        redirectedTo,
        "/ledger/index.html",
        "Existing Ledger session must stay in Ledger"
    );
});
