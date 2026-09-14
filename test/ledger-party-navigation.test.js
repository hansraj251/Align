const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const vm = require("vm");

test("Ledger index refreshes automatically without a refresh button", () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/ledger.js"),
        "utf8"
    );

    assert.doesNotMatch(
        source,
        /refreshButton/,
        "Ledger index must not depend on the manual refresh button"
    );

    assert.match(
        source,
        /setInterval\(refresh,\s*30000\)/,
        "Ledger index must refresh automatically every 30 seconds"
    );
});

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
        setInterval() {
            return 1;
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

    assert.match(
        row.innerHTML,
        /₹500/,
        "Party card must show the calculated net balance"
    );

    assert.match(
        row.innerHTML,
        /party-balance-give/,
        "Positive balance must use the You will give balance class"
    );


    assert.equal(
        elements.receivableAmount.textContent,
        "₹500",
        "Receivable summary must include the party net balance"
    );

    assert.equal(
        elements.payableAmount.textContent,
        "₹0",
        "Payable summary must remain zero"
    );

    row.dispatchEvent({
        type: "click"
    });

    assert.equal(
        redirectedTo,
        "/ledger/party.html?id=42",
        "Clicking a party must open its Khata detail page"
    );
});

test("Ledger index uses green for You will give and red for You will get", () => {
    const cssSource = fs.readFileSync(
        require.resolve("../public/ledger/css/ledger.css"),
        "utf8"
    );

    assert.match(
        cssSource,
        /\.party-balance-give\s+\.party-balance-amount\s*\{[\s\S]*?color:\s*#16a34a/,
        "You will give amount must be green"
    );

    assert.match(
        cssSource,
        /\.party-balance-get\s+\.party-balance-amount\s*\{[\s\S]*?color:\s*#dc2626/,
        "You will get amount must be red"
    );
});

test("Ledger zero party balance uses yellow", () => {
    const cssSource = fs.readFileSync(
        require.resolve("../public/ledger/css/ledger.css"),
        "utf8"
    );

    assert.match(
        cssSource,
        /\.party-balance-zero\s+\.party-balance-amount\s*\{[\s\S]*?color:\s*#ca8a04/,
        "Zero party balance amount must be yellow"
    );
});

test("Ledger summary cards use green for You will give and red for You will get", () => {
    const cssSource = fs.readFileSync(
        require.resolve("../public/ledger/css/ledger.css"),
        "utf8"
    );

    assert.match(
        cssSource,
        /\.get-card\s+strong\s*\{[\s\S]*?color:\s*#16a34a/,
        "You will give summary amount must be green"
    );

    assert.match(
        cssSource,
        /\.give-card\s+strong\s*\{[\s\S]*?color:\s*#dc2626/,
        "You will get summary amount must be red"
    );
});
