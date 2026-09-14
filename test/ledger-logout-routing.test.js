const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const vm = require("vm");

test("Ledger logout routes directly to the Ledger login page", () => {
    const ledgerSource =
        fs.readFileSync(
            require.resolve("../public/ledger/js/ledger.js"),
            "utf8"
        );

    let redirectedTo = "";
    let tokenRemoved = false;

    const elements = {
        logoutButton: {
            addEventListener(event, handler) {
                if (event === "click") {
                    this.click = handler;
                }
            }
        }
    };

    const context = {
        console: {
            error() {}
        },
        window: {
            Auth: {
                requireLogin() {}
            },
            location: {
                get href() {
                    return redirectedTo;
                },
                set href(value) {
                    redirectedTo = value;
                }
            }
        },
        Auth: {
            requireLogin() {}
        },
        localStorage: {
            getItem() {
                return "ledger-token";
            },
            removeItem(key) {
                if (key === "token") {
                    tokenRemoved = true;
                }
            }
        },
        document: {
            getElementById(id) {
                return elements[id] || {
                    addEventListener() {}
                };
            },
            addEventListener() {},
            querySelectorAll() {
                return [];
            }
        },
        fetch: async () => ({
            ok: true,
            status: 200,
            async json() {
                return {
                    success: true
                };
            }
        }),
        Intl,
        Number,
        setInterval() {},
        alert() {}
    };

    vm.runInNewContext(
        ledgerSource,
        context
    );

    assert.equal(
        typeof elements.logoutButton.click,
        "function"
    );

    elements.logoutButton.click();

    assert.equal(
        tokenRemoved,
        true,
        "Ledger logout must clear the common token"
    );

    assert.equal(
        redirectedTo,
        "/ledger/login.html",
        "Ledger logout must go directly to Ledger login"
    );
});
