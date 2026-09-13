const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const vm = require("vm");

test("Ledger party row opens that party's Khata detail page", async () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/ledger.js"),
        "utf8"
    );

    let redirectedTo = "";

    const elements = {
        selectedBookName: {},
        bookMenu: { addEventListener() {} },
        ledgerBookButton: { addEventListener() {} },
        createBookButton: { addEventListener() {} },
        logoutButton: { addEventListener() {} },
        receivableAmount: { textContent: "" },
        payableAmount: { textContent: "" },
        reportsButton: { addEventListener() {} },
        partySearch: { addEventListener() {}, value: "" },
        clearSearch: { addEventListener() {}, hidden: true },
        partyCountText: { textContent: "" },
        partiesList: {
            innerHTML: "",
            appendChild(node) {
                this.child = node;
            }
        },
        emptyState: { hidden: true },
        noSearchResults: { hidden: true },
        refreshButton: { addEventListener() {}, disabled: false },
        addPartyButton: { addEventListener() {} },
        emptyAddPartyButton: { addEventListener() {} },
        partyModal: { addEventListener() {}, hidden: true },
        closePartyModal: { addEventListener() {} },
        cancelPartyButton: { addEventListener() {} },
        partyForm: {
            addEventListener() {},
            reset() {},
            querySelector() {
                return { disabled: false };
            }
        },
        partyName: { focus() {} },
        partyMobile: {},
        partyAddress: {},
        partyFormError: { hidden: true }
    };

    const context = {
        Auth: {
            requireLogin() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            },
            removeItem() {}
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
                return elements[id];
            },
            createElement() {
                const listeners = {};
                return {
                    type: "",
                    className: "",
                    innerHTML: "",
                    addEventListener(type, handler) {
                        listeners[type] = handler;
                    },
                    dispatchEvent(event) {
                        if (listeners[event.type]) {
                            listeners[event.type](event);
                        }
                    }
                };
            },
            querySelector() {
                return null;
            },
            querySelectorAll() {
                return [];
            },
            addEventListener() {}
        },
        fetch: async () => ({
            ok: true,
            status: 200,
            async json() {
                return {
                    success: true,
                    parties: [
                        {
                            id: 42,
                            name: "Test Party",
                            mobile: "9876543210",
                            net_balance: 500
                        }
                    ]
                };
            }
        }),
        alert() {},
        setTimeout(callback) {
            callback();
        },
        Intl,
        console: {
            error(...args) {
                throw new Error(
                    args.map((value) => String(value)).join(" ")
                );
            }
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    const row = elements.partiesList.child;

    assert.ok(row, "Party row should be rendered");

    row.dispatchEvent({
        type: "click"
    });

    assert.equal(
        redirectedTo,
        "/ledger/party.html?id=42",
        "Clicking a party must open its Khata detail page"
    );
});
