const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const vm = require("vm");
const cssSource = fs.readFileSync(
    require.resolve("../public/ledger/css/ledger.css"),
    "utf8"
);

test("Ledger Party Detail loads the selected party", async () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    const scriptMatch = html.match(
        /<script[^>]+src="([^"]*ledger[^"]*\.js)"[^>]*><\/script>/
    );

    assert.ok(
        scriptMatch,
        "Party detail page must load a Ledger detail JavaScript file"
    );

    const scriptPath = `../public${scriptMatch[1]}`;
    const source = fs.readFileSync(
        require.resolve(scriptPath),
        "utf8"
    );

    const elements = {
        partyLoading: { hidden: false },
        partyError: {
            hidden: true,
            textContent: "",
            querySelector() {
                return {
                    textContent: ""
                };
            }
        },
        partyDetails: { hidden: true },
        partyName: { textContent: "" },
        partyMobile: { textContent: "" },
        partyBalance: { textContent: "" },
        partyBalanceLabel: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            }
        },
        transactionsList: { innerHTML: "" },
        logoutButton: {
            addEventListener() {}
        }
    };

    let requestedPath = "";

    const context = {
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            },
            removeItem() {}
        },
        window: {
            location: {
                search: "?id=42",
                href: ""
            }
        },
        URLSearchParams,
        document: {
            addEventListener(event, handler) {
                if (event === "DOMContentLoaded") {
                    handler();
                }
            },
            getElementById(id) {
                return elements[id];
            },
            querySelectorAll() {
                return [];
            },
            createElement() {
                return {
                    addEventListener() {},
                    classList: {
                        add() {},
                        remove() {}
                    },
                    textContent: "",
                    innerHTML: ""
                };
            }
        },
        fetch: async (path) => {
            requestedPath = path;

            return {
                ok: true,
                status: 200,
                async json() {
                    return {
                        success: true,
                        party: {
                            id: 42,
                            name: "Test Party",
                            mobile: "9876543210",
                            net_balance: 500,
                            balance_type: "receivable"
                        }
                    };
                }
            };
        },
        Intl,
        console: {
            error() {}
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    assert.equal(
        requestedPath,
        "/api/ledger/transactions/party/42",
        "Party detail must continue loading after the selected party is fetched"
    );

    assert.equal(
        elements.partyName.textContent,
        "Test Party",
        "Party name must be rendered"
    );
});

test("Ledger Party Detail loads and renders the party transaction history", async () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    const scriptMatch = html.match(
        /<script[^>]+src="([^"]*ledger[^"]*\.js)"[^>]*><\/script>/
    );

    assert.ok(scriptMatch);

    const scriptPath = `../public${scriptMatch[1]}`;
    const source = fs.readFileSync(
        require.resolve(scriptPath),
        "utf8"
    );

    const elements = {
        partyLoading: { hidden: false },
        partyError: {
            hidden: true,
            textContent: "",
            querySelector() {
                return {
                    textContent: ""
                };
            }
        },
        partyDetails: { hidden: true },
        partyName: { textContent: "" },
        partyMobile: { textContent: "" },
        partyBalance: { textContent: "" },
        partyBalanceLabel: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            }
        },
        transactionsList: {
            innerHTML: "",
            appendChild(child) {
                this.innerHTML += child.textContent || "";
            }
        },
        logoutButton: {
            addEventListener() {}
        }
    };

    const requestedPaths = [];

    const context = {
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            },
            removeItem() {}
        },
        window: {
            location: {
                search: "?id=42",
                href: ""
            }
        },
        URLSearchParams,
        document: {
            addEventListener(event, handler) {
                if (event === "DOMContentLoaded") {
                    handler();
                }
            },
            getElementById(id) {
                return elements[id];
            },
            querySelectorAll() {
                return [];
            },
            createElement() {
                return {
                    addEventListener() {},
                    classList: {
                        add() {},
                        remove() {}
                    },
                    textContent: "",
                    innerHTML: ""
                };
            }
        },
        fetch: async (path) => {
            requestedPaths.push(path);

            if (path === "/api/ledger/parties/42") {
                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            party: {
                                id: 42,
                                name: "Test Party",
                                mobile: "9876543210",
                                net_balance: 500,
                                balance_type: "receivable"
                            }
                        };
                    }
                };
            }

            if (path === "/api/ledger/transactions/party/42") {
                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            transactions: [
                                {
                                    id: 7,
                                    transaction_type: "credit",
                                    amount: 500,
                                    transaction_date: "2026-09-13",
                                    interest_rate: 12.5,
                                    description: "Advance payment"
                                }
                            ]
                        };
                    }
                };
            }

            throw new Error(`Unexpected API path: ${path}`);
        },
        Intl,
        console: {
            error() {}
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    assert.deepEqual(
        requestedPaths,
        [
            "/api/ledger/parties/42",
            "/api/ledger/transactions/party/42"
        ],
        "Party detail must load both party information and transaction history"
    );

    assert.match(
        elements.transactionsList.innerHTML,
        /Advance payment/,
        "Transaction description must be rendered"
    );

    assert.match(
        elements.transactionsList.innerHTML,
        /<span class="party-balance-label">You Got<\/span>[\s\S]*?<span class="party-transaction-amount">₹500<\/span>/,
        "Credit transaction must show You Got before the principal amount"
    );

    assert.match(
        elements.transactionsList.innerHTML,
        /<span class="party-transaction-interest">\s*\(INT\. ₹0\.17\)<\/span>/,
        "Credit transaction must show its calculated interest"
    );
    assert.doesNotMatch(
        elements.transactionsList.innerHTML,
        />Transaction</,
        "Empty transaction notes must not show the Transaction fallback"
    );

    assert.match(
        elements.transactionsList.innerHTML,
        /party-name/,
        "Transaction description must use the party-name element"
    );
    assert.match(
        cssSource,
        /\.party-name[\s\S]*?overflow-wrap:\s*anywhere/,
        "Long transaction notes must wrap inside the card"
    );
});


test("Ledger Party Detail makes the party header editable", () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    assert.match(
        html,
        /id=["']partyName["'][^>]*>/,
        "Party name must remain available in the party header"
    );

    assert.match(
        html,
        /id=["']partyMobile["'][^>]*>/,
        "Party mobile must remain available in the party header"
    );

    assert.match(
        html,
        /id=["']partyHeaderActions["'][^>]*>/,
        "Party header must provide an actions container"
    );

    assert.match(
        html,
        /data-action=["']edit-party["']/,
        "Party header must provide an Edit action"
    );

    assert.match(
        html,
        /data-action=["']delete-party["']/,
        "Party header must provide a Delete action"
    );
});

test("Ledger Party Detail provides an Add Transaction form for the selected party", () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    assert.match(
        html,
        /id="addTransactionButton"/,
        "Party detail must provide an Add Transaction button"
    );

    assert.match(
        html,
        /id="transactionForm"/,
        "Party detail must provide a transaction form"
    );

    assert.match(
        html,
        /id="transactionType"/,
        "Transaction form must provide a transaction type field"
    );

    assert.match(
        html,
        /id="transactionAmount"/,
        "Transaction form must provide an amount field"
    );

    assert.match(
        html,
        /id="transactionDate"/,
        "Transaction form must provide a transaction date field"
    );

    assert.match(
        html,
        /id="transactionDescription"/,
        "Transaction form must provide a transaction description field"
    );

    assert.match(
        html,
        /id=["']transactionInterestRate["'][^>]*value=["']0["']/,
        "Interest rate must default to zero"
    );
});

test("Ledger Party Detail provides You Gave and You Got transaction buttons", () => {
    const html = fs.readFileSync("public/ledger/party.html", "utf8");

    assert.match(html, /You Gave/i);
    assert.match(html, /You Got/i);
    assert.match(html, /data-transaction-type=["']debit["']/);
    assert.match(html, /data-transaction-type=["']credit["']/);
});

test("Ledger Party Detail defaults a new transaction to You Gave", () => {
    const html = fs.readFileSync(
        "public/ledger/party.html",
        "utf8"
    );

    assert.match(
        html,
        /id=["']transactionType["'][^>]*value=["']debit["']/
    );
});

test("Ledger Party Detail saves a new transaction for the selected party", async () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    const scriptMatch = html.match(
        /<script[^>]+src="([^"]*ledger[^"]*\.js)"[^>]*><\/script>/
    );

    assert.ok(scriptMatch);

    const scriptPath = `../public${scriptMatch[1]}`;
    const source = fs.readFileSync(
        require.resolve(scriptPath),
        "utf8"
    );

    const listeners = {};
    const elements = {
        partyLoading: { hidden: false },
        partyError: {
            hidden: true,
            textContent: "",
            querySelector() {
                return { textContent: "" };
            }
        },
        partyDetails: { hidden: true },
        partyName: { textContent: "" },
        partyMobile: { textContent: "" },
        partyBalance: { textContent: "" },
        partyBalanceLabel: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            }
        },
        transactionsList: {
            innerHTML: "",
            appendChild(child) {
                this.innerHTML += child.textContent || "";
            }
        },
        logoutButton: {
            addEventListener(event, handler) {
                listeners.logout = handler;
            }
        },
        addTransactionButton: {
            addEventListener(event, handler) {
                listeners.addTransaction = handler;
            }
        },
        closeTransactionModal: {
            addEventListener() {}
        },
        cancelTransactionButton: {
            addEventListener() {}
        },
        transactionModal: {
            hidden: true
        },
        transactionForm: {
            addEventListener(event, handler) {
                if (event === "submit") {
                    listeners.transactionSubmit = handler;
                }
            },
            reset() {}
        },
        transactionType: {
            value: "credit"
        },
        transactionAmount: {
            value: "1250"
        },
        transactionDate: {
            value: "2026-09-13"
        },
        transactionDescription: {
            value: "Advance payment"
        },
        transactionInterestRate: {
            value: "12.5"
        },
        transactionFormError: {
            hidden: true,
            textContent: ""
        }
    };

    const requestedCalls = [];

    const context = {
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            },
            removeItem() {}
        },
        window: {
            location: {
                search: "?id=42",
                href: ""
            }
        },
        URLSearchParams,
        document: {
            addEventListener(event, handler) {
                if (event === "DOMContentLoaded") {
                    handler();
                }
            },
            getElementById(id) {
                return elements[id];
            },
            querySelectorAll() {
                return [];
            },
            createElement() {
                return {
                    addEventListener() {},
                    classList: {
                        add() {},
                        remove() {}
                    },
                    textContent: "",
                    innerHTML: ""
                };
            }
        },
        fetch: async (path, options = {}) => {
            requestedCalls.push({
                path,
                options
            });

            if (path === "/api/ledger/parties/42") {
                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            party: {
                                id: 42,
                                name: "Test Party",
                                mobile: "9876543210",
                                net_balance: 500,
                                balance_type: "receivable"
                            }
                        };
                    }
                };
            }

            if (path === "/api/ledger/transactions/party/42") {
                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            transactions: []
                        };
                    }
                };
            }

            if (path === "/api/ledger/transactions/party/42" &&
                options.method === "POST") {
                return {
                    ok: true,
                    status: 201,
                    async json() {
                        return {
                            success: true,
                            transaction: {
                                id: 8
                            }
                        };
                    }
                };
            }

            throw new Error(`Unexpected API path: ${path}`);
        },
        Intl,
        console: {
            error() {}
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    assert.ok(
        listeners.transactionSubmit,
        "Transaction form must have a submit handler"
    );

    const submitEvent = {
        preventDefault() {}
    };

    await listeners.transactionSubmit(submitEvent);

    const createCall = requestedCalls.find(
        (call) =>
            call.path === "/api/ledger/transactions/party/42" &&
            call.options.method === "POST"
    );

    assert.ok(
        createCall,
        "Saving the transaction must POST to the selected party transaction endpoint"
    );

    assert.deepEqual(
        JSON.parse(createCall.options.body),
        {
            transactionType: "credit",
            amount: 1250,
            transactionDate: "2026-09-13",
            description: "Advance payment",
            interestRate: 12.5
        },
        "Transaction payload must contain the entered accounting details"
    );
});

test("Ledger Party Detail refreshes the party balance after saving a transaction", async () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    const scriptMatch = html.match(
        /<script[^>]+src="([^"]*ledger[^"]*\.js)"[^>]*><\/script>/
    );

    assert.ok(scriptMatch);

    const scriptPath = `../public${scriptMatch[1]}`;
    const source = fs.readFileSync(
        require.resolve(scriptPath),
        "utf8"
    );

    const listeners = {};
    const elements = {
        partyLoading: { hidden: false },
        partyError: {
            hidden: true,
            textContent: "",
            querySelector() {
                return { textContent: "" };
            }
        },
        partyDetails: { hidden: true },
        partyName: { textContent: "" },
        partyMobile: { textContent: "" },
        partyBalance: { textContent: "" },
        partyBalanceLabel: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            }
        },
        partyInterest: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            },
            closest() {
                return { hidden: false };
            }
        },
        transactionsList: {
            innerHTML: "",
            appendChild(child) {
                this.innerHTML += child.textContent || "";
            }
        },
        logoutButton: {
            addEventListener() {}
        },
        addTransactionButton: {
            addEventListener(event, handler) {
                listeners.addTransaction = handler;
            }
        },
        closeTransactionModal: {
            addEventListener() {}
        },
        cancelTransactionButton: {
            addEventListener() {}
        },
        transactionModal: { hidden: true },
        transactionForm: {
            addEventListener(event, handler) {
                if (event === "submit") {
                    listeners.transactionSubmit = handler;
                }
            },
            reset() {}
        },
        transactionType: { value: "credit" },
        transactionAmount: { value: "1250" },
        transactionDate: { value: "2026-09-13" },
        transactionInterestRate: { value: "12.5" },
        transactionDescription: { value: "Advance payment" },
        transactionFormError: {
            hidden: true,
            textContent: ""
        }
    };

    let partyRequestCount = 0;

    const context = {
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            },
            removeItem() {}
        },
        window: {
            location: {
                search: "?id=42",
                href: ""
            }
        },
        URLSearchParams,
        document: {
            addEventListener(event, handler) {
                if (event === "DOMContentLoaded") {
                    handler();
                }
            },
            getElementById(id) {
                return elements[id];
            },
            querySelectorAll() {
                return [];
            },
            createElement() {
                return {
                    addEventListener() {},
                    classList: {
                        add() {},
                        remove() {}
                    },
                    textContent: "",
                    innerHTML: ""
                };
            }
        },
        fetch: async (path, options = {}) => {
            if (
                path === "/api/ledger/parties/42" &&
                !options.method
            ) {
                partyRequestCount += 1;

                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            party: {
                                id: 42,
                                name: "Test Party",
                                mobile: "9876543210",
                                net_balance:
                                    partyRequestCount === 1
                                        ? 500
                                        : 1750,
                                balance_type: "receivable"
                            }
                        };
                    }
                };
            }

            if (
                path === "/api/ledger/transactions/party/42" &&
                !options.method
            ) {
                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            transactions: []
                        };
                    }
                };
            }

            if (
                path === "/api/ledger/transactions/party/42" &&
                options.method === "POST"
            ) {
                return {
                    ok: true,
                    status: 201,
                    async json() {
                        return {
                            success: true,
                            transaction: {
                                id: 8
                            }
                        };
                    }
                };
            }

            throw new Error(`Unexpected API path: ${path}`);
        },
        Intl,
        console: {
            error() {}
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    assert.equal(
        elements.partyBalance.textContent,
        "₹500.00",
        "Initial party balance must be rendered"
    );

    await listeners.transactionSubmit({
        preventDefault() {}
    });

    assert.equal(
        partyRequestCount,
        2,
        "Party balance must be fetched again after saving a transaction"
    );

    assert.equal(
        elements.partyBalance.textContent,
        "₹1,750.00",
        "Updated party balance must be rendered after saving"
    );
});

test("Ledger Party Detail renders edit and delete controls with the transaction ID", async () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    const scriptMatch = html.match(
        /<script[^>]+src="([^"]*ledger[^"]*\.js)"[^>]*><\/script>/
    );

    assert.ok(scriptMatch);

    const scriptPath = `../public${scriptMatch[1]}`;
    const source = fs.readFileSync(
        require.resolve(scriptPath),
        "utf8"
    );

    const elements = {
        partyLoading: { hidden: false },
        partyError: {
            hidden: true,
            textContent: "",
            querySelector() {
                return { textContent: "" };
            }
        },
        partyDetails: { hidden: true },
        partyName: { textContent: "" },
        partyMobile: { textContent: "" },
        partyBalance: { textContent: "" },
        partyBalanceLabel: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            }
        },
        transactionsList: {
            innerHTML: "",
            appendChild(child) {
                this.innerHTML += child.textContent || "";
            }
        },
        logoutButton: {
            addEventListener() {}
        },
        addTransactionButton: {
            addEventListener() {}
        },
        closeTransactionModal: {
            addEventListener() {}
        },
        cancelTransactionButton: {
            addEventListener() {}
        },
        transactionModal: { hidden: true },
        transactionForm: {
            addEventListener() {},
            reset() {}
        },
        transactionType: { value: "credit" },
        transactionAmount: { value: "" },
        transactionDate: { value: "" },
        transactionInterestRate: { value: "12.5" },
        transactionDescription: { value: "" },
        transactionFormError: {
            hidden: true,
            textContent: ""
        }
    };

    const context = {
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            }
        },
        window: {
            location: {
                search: "?id=42",
                href: ""
            }
        },
        URLSearchParams,
        document: {
            addEventListener(event, handler) {
                if (event === "DOMContentLoaded") {
                    handler();
                }
            },
            getElementById(id) {
                return elements[id];
            },
            querySelectorAll() {
                return [];
            },
            createElement() {
                return {
                    addEventListener() {},
                    classList: {
                        add() {},
                        remove() {}
                    },
                    textContent: "",
                    innerHTML: ""
                };
            }
        },
        fetch: async (path) => {
            if (path === "/api/ledger/parties/42") {
                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            party: {
                                id: 42,
                                name: "Test Party",
                                mobile: "9876543210",
                                net_balance: 500,
                                balance_type: "receivable"
                            }
                        };
                    }
                };
            }

            if (path === "/api/ledger/transactions/party/42") {
                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            transactions: [
                                {
                                    id: 7,
                                    transaction_type: "credit",
                                    amount: 500,
                                    transaction_date: "2026-09-13",
                                    interest_rate: 12.5,
                                    description: "Advance payment"
                                }
                            ]
                        };
                    }
                };
            }

            throw new Error(`Unexpected API path: ${path}`);
        },
        Intl,
        console: {
            error() {}
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    assert.match(
        elements.transactionsList.innerHTML,
        /Edit/,
        "Each transaction must have an Edit action"
    );

    assert.match(
        elements.transactionsList.innerHTML,
        /Delete/,
        "Each transaction must have a Delete action"
    );

    assert.match(
        elements.transactionsList.innerHTML,
        /7/,
        "Transaction actions must identify the transaction by ID"
    );
});


test("Ledger Party Detail edits an existing transaction using its transaction ID", async () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    const scriptMatch = html.match(
        /<script[^>]+src="([^"]*ledger[^"]*\.js)"[^>]*><\/script>/
    );

    assert.ok(scriptMatch);

    const scriptPath = `../public${scriptMatch[1]}`;
    const source = fs.readFileSync(
        require.resolve(scriptPath),
        "utf8"
    );

    const listeners = {};
    const elements = {
        partyLoading: { hidden: false },
        partyError: {
            hidden: true,
            querySelector() {
                return { textContent: "" };
            }
        },
        partyDetails: { hidden: true },
        partyName: { textContent: "" },
        partyMobile: { textContent: "" },
        partyBalance: { textContent: "" },
        partyBalanceLabel: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            }
        },
        partyInterest: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            },
            closest() {
                return { hidden: false };
            }
        },
        transactionsList: {
            innerHTML: "",
            addEventListener(event, handler) {
                listeners.transactionsClick = handler;
            }
        },
        logoutButton: {
            addEventListener() {}
        },
        addTransactionButton: {
            addEventListener(event, handler) {
                listeners.addTransaction = handler;
            }
        },
        closeTransactionModal: {
            addEventListener() {}
        },
        cancelTransactionButton: {
            addEventListener() {}
        },
        transactionModal: { hidden: true },
        transactionForm: {
            addEventListener(event, handler) {
                listeners.formSubmit = handler;
            },
            reset() {}
        },
        transactionSubmitButton: {
            textContent: "Save Transaction"
        },
        transactionType: { value: "credit" },
        transactionAmount: { value: "" },
        transactionDate: { value: "" },
        transactionInterestRate: { value: "12.5" },
        transactionDescription: { value: "" },
        transactionFormError: {
            hidden: true,
            textContent: ""
        },
        transactionModalTitle: {
            textContent: "Add Transaction"
        }
    };

    let putRequest = null;
    let partyLoads = 0;
    let transactionLoads = 0;

    const context = {
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            }
        },
        window: {
            location: {
                search: "?id=42",
                href: ""
            },
            confirm() {
                return true;
            }
        },
        URLSearchParams,
        document: {
            addEventListener(event, handler) {
                if (event === "DOMContentLoaded") {
                    handler();
                }
            },
            getElementById(id) {
                return elements[id];
            },
            querySelectorAll() {
                return [];
            }
        },
        fetch: async (path, options = {}) => {
            if (path === "/api/ledger/parties/42") {
                partyLoads += 1;

                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            party: {
                                id: 42,
                                name: "Test Party",
                                mobile: "9876543210",
                                net_balance: 500,
                                balance_type: "receivable"
                            }
                        };
                    }
                };
            }

            if (path === "/api/ledger/transactions/party/42") {
                transactionLoads += 1;

                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            transactions: [
                                {
                                    id: 7,
                                    transaction_type: "credit",
                                    amount: 500,
                                    transaction_date: "2026-09-13",
                                    interest_rate: 12.5,
                                    description: "Advance payment"
                                }
                            ]
                        };
                    }
                };
            }

            if (
                path === "/api/ledger/transactions/party/42/7" &&
                options.method === "PUT"
            ) {
                putRequest = {
                    path,
                    options
                };

                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            transaction: {
                                id: 7
                            }
                        };
                    }
                };
            }

            throw new Error(
                `Unexpected API request: ${options.method || "GET"} ${path}`
            );
        },
        Intl,
        console: {
            error() {}
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    const editButton = {
        dataset: {
            action: "edit",
            transactionId: "7"
        },
        closest() {
            return this;
        }
    };

    listeners.transactionsClick({
        target: editButton
    });

    assert.equal(
        elements.transactionType.value,
        "credit"
    );

    assert.equal(
        elements.transactionAmount.value,
        500
    );

    assert.equal(
        elements.transactionDate.value,
        "2026-09-13"
    );

    assert.equal(
        elements.transactionDescription.value,
        "Advance payment"
    );

    elements.transactionAmount.value = "750";
    elements.transactionDescription.value = "Updated payment";

    await listeners.formSubmit({
        preventDefault() {}
    });

    assert.ok(
        putRequest,
        "Editing a transaction must send a PUT request"
    );

    assert.equal(
        putRequest.path,
        "/api/ledger/transactions/party/42/7"
    );

    assert.equal(
        putRequest.options.method,
        "PUT"
    );

    assert.deepEqual(
        JSON.parse(putRequest.options.body),
        {
            transactionType: "credit",
            amount: 750,
            transactionDate: "2026-09-13",
            description: "Updated payment",
            interestRate: 12.5
        }
    );

    assert.ok(
        partyLoads >= 2,
        "Party details must reload after editing"
    );

    assert.ok(
        transactionLoads >= 2,
        "Transaction history must reload after editing"
    );
});


test("Ledger Party Detail deletes an existing transaction using its transaction ID", async () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    const scriptMatch = html.match(
        /<script[^>]+src="([^"]*ledger[^"]*\.js)"[^>]*><\/script>/
    );

    assert.ok(scriptMatch);

    const scriptPath = `../public${scriptMatch[1]}`;
    const source = fs.readFileSync(
        require.resolve(scriptPath),
        "utf8"
    );

    const listeners = {};
    const elements = {
        partyLoading: { hidden: false },
        partyError: {
            hidden: true,
            querySelector() {
                return { textContent: "" };
            }
        },
        partyDetails: { hidden: true },
        partyName: { textContent: "" },
        partyMobile: { textContent: "" },
        partyBalance: { textContent: "" },
        partyBalanceLabel: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            }
        },
        partyInterest: {
            textContent: "",
            classList: {
                add() {},
                remove() {}
            },
            closest() {
                return { hidden: false };
            }
        },
        transactionsList: {
            innerHTML: "",
            addEventListener(event, handler) {
                listeners.transactionsClick = handler;
            }
        },
        logoutButton: {
            addEventListener() {}
        },
        addTransactionButton: {
            addEventListener() {}
        },
        closeTransactionModal: {
            addEventListener() {}
        },
        cancelTransactionButton: {
            addEventListener() {}
        },
        transactionModal: { hidden: true },
        transactionForm: {
            addEventListener() {},
            reset() {}
        },
        transactionSubmitButton: {
            textContent: "Save Transaction"
        },
        transactionType: { value: "credit" },
        transactionAmount: { value: "" },
        transactionDate: { value: "" },
        transactionDescription: { value: "" },
        transactionFormError: {
            hidden: true,
            textContent: ""
        },
        transactionModalTitle: {
            textContent: "Add Transaction"
        }
    };

    let deleteRequest = null;
    let partyLoads = 0;
    let transactionLoads = 0;

    const context = {
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem(key) {
                return key === "token" ? "ledger-token" : null;
            }
        },
        window: {
            location: {
                search: "?id=42",
                href: ""
            },
            confirm() {
                return true;
            }
        },
        URLSearchParams,
        document: {
            addEventListener(event, handler) {
                if (event === "DOMContentLoaded") {
                    handler();
                }
            },
            getElementById(id) {
                return elements[id];
            },
            querySelectorAll() {
                return [];
            }
        },
        fetch: async (path, options = {}) => {
            if (path === "/api/ledger/parties/42") {
                partyLoads += 1;

                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            party: {
                                id: 42,
                                name: "Test Party",
                                mobile: "9876543210",
                                net_balance: 500,
                                balance_type: "receivable"
                            }
                        };
                    }
                };
            }

            if (path === "/api/ledger/transactions/party/42") {
                transactionLoads += 1;

                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true,
                            transactions: [
                                {
                                    id: 7,
                                    transaction_type: "credit",
                                    amount: 500,
                                    transaction_date: "2026-09-13",
                                    description: "Advance payment"
                                }
                            ]
                        };
                    }
                };
            }

            if (
                path === "/api/ledger/transactions/party/42/7" &&
                options.method === "DELETE"
            ) {
                deleteRequest = {
                    path,
                    options
                };

                return {
                    ok: true,
                    status: 200,
                    async json() {
                        return {
                            success: true
                        };
                    }
                };
            }

            throw new Error(
                `Unexpected API request: ${options.method || "GET"} ${path}`
            );
        },
        Intl,
        console: {
            error() {}
        }
    };

    vm.runInNewContext(source, context);

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    const deleteButton = {
        dataset: {
            action: "delete",
            transactionId: "7"
        },
        closest() {
            return this;
        }
    };

    listeners.transactionsClick({
        target: deleteButton
    });

    await new Promise((resolve) => global.setTimeout(resolve, 25));

    assert.ok(
        deleteRequest,
        "Deleting a transaction must send a DELETE request"
    );

    assert.equal(
        deleteRequest.path,
        "/api/ledger/transactions/party/42/7"
    );

    assert.equal(
        deleteRequest.options.method,
        "DELETE"
    );

    assert.ok(
        partyLoads >= 2,
        "Party details must reload after deleting"
    );

    assert.ok(
        transactionLoads >= 2,
        "Transaction history must reload after deleting"
    );
});

test("Ledger Party Detail calculates net interest through today for all transactions", () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );

    assert.match(
        source,
        /calculate.*interest|interest.*calculate/i,
        "Party detail must calculate transaction interest"
    );

    assert.match(
        source,
        /transaction_date/,
        "Interest calculation must use each transaction date"
    );

    assert.match(
        source,
        /interest_rate/,
        "Interest calculation must use each transaction interest rate"
    );

    assert.match(
        source,
        /365/,
        "Annual interest must be prorated using 365 days"
    );
});

test("Ledger Party Detail calculates the exact net interest amount", () => {
    const source = fs.readFileSync(require.resolve("../public/ledger/js/party.js"), "utf8");

    const context = {
        document: {
            getElementById: () => ({
                addEventListener() {},
                classList: {
                    add() {},
                    remove() {}
                },
                querySelector() {
                    return null;
                },
                querySelectorAll() {
                    return [];
                }
            }),
            querySelectorAll() {
                return [];
            }
        },
        window: {
            location: {
                search: "?id=1"
            }
        },
        Auth: {
            requireLogin() {},
            logout() {}
        },
        localStorage: {
            getItem() {
                return null;
            }
        },
        URLSearchParams,
        Intl,
        Date,
        console
    };

    vm.createContext(context);
    vm.runInContext(source, context);

    const today = new Date("2026-09-14T00:00:00Z");

    const transactions = [
        {
            amount: 1000,
            transaction_type: "debit",
            transaction_date: "2026-09-10",
            interest_rate: 12
        },
        {
            amount: 500,
            transaction_type: "credit",
            transaction_date: "2026-09-13",
            interest_rate: 12.5
        },
        {
            amount: 1000,
            transaction_type: "debit",
            transaction_date: "2026-09-20",
            interest_rate: 12
        }
    ];

    const expected =
        (1000 * 0.12 * (4 / 365)) -
        (500 * 0.125 * (1 / 365));

    const actual = context.calculateNetInterest(transactions, today);

    assert.ok(Math.abs(actual - expected) < 1e-10);
});

test("Ledger Party Detail provides an INT summary card", () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    assert.match(
        html,
        /id="partyInterest"/,
        "Party detail must provide an INT summary value"
    );

    assert.match(
        html,
        /INT\./,
        "Party detail must label the interest summary card as INT."
    );
});

test("Ledger Party Detail shows transaction interest only when interest rate is greater than zero", () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );

    assert.match(
        source,
        /interest_rate\s*>\s*0|Number\(transaction\.interest_rate.*>\s*0/,
        "Transaction card must check that interest rate is greater than zero before showing INT."
    );

    assert.match(
        source,
        /INT\.\s*.*format.*interest|INT\.\s*.*calculateTransactionInterest|calculateTransactionInterest.*INT\./s,
        "Transaction card must render calculated interest beside the transaction amount"
    );
});


test("Ledger transaction card uses opposite colors for principal and interest", () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );
    const cssSource = fs.readFileSync(
        require.resolve("../public/ledger/css/ledger.css"),
        "utf8"
    );

    assert.match(
        source,
        /transaction-gave[\s\S]*party-transaction-amount[\s\S]*interestLabel|interestLabel[\s\S]*party-transaction-amount/,
        "Transaction card must expose principal amount separately from interest"
    );

    assert.match(
        source,
        /party-transaction-interest/,
        "Transaction card must expose interest separately for coloring"
    );

    assert.match(
        cssSource,
        /transaction-gave[\s\S]*party-transaction-interest[\s\S]*color/,
        "You Gave interest must use the opposite color"
    );

    assert.match(
        cssSource,
        /transaction-got[\s\S]*party-transaction-interest[\s\S]*color/,
        "You Got interest must use the opposite color"
    );
});


test("Party balance status uses green for You Will Give, red for You Will Get, and yellow for Settled", () => {
    const partyJs = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );

    assert.match(
        partyJs,
        /partyBalanceLabel\.classList[\s\S]*?party-balance-give/,
        "You Will Give must apply the green balance status class"
    );

    assert.match(
        partyJs,
        /partyBalanceLabel\.classList[\s\S]*?party-balance-get/,
        "You Will Get must apply the red balance status class"
    );

    assert.match(
        partyJs,
        /partyBalanceLabel\.classList[\s\S]*?party-balance-settled/,
        "Settled must apply the yellow balance status class"
    );
});

test("Party INT card is hidden at zero and colored by net interest sign", () => {
    const partyJs = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );

    assert.match(
        partyJs,
        /partyInterest[\s\S]*?hidden\s*=/,
        "INT card must be hidden when net interest is zero"
    );

    assert.match(
        partyJs,
        /partyInterest[\s\S]*?party-interest-positive/,
        "Positive INT must apply the positive interest class"
    );

    assert.match(
        partyJs,
        /partyInterest[\s\S]*?party-interest-negative/,
        "Negative INT must apply the negative interest class"
    );
});

test("Party page defines green, red, and yellow status colors for balance and INT", () => {
    const cssSource = fs.readFileSync(
        require.resolve("../public/ledger/css/ledger.css"),
        "utf8"
    );

    assert.match(
        cssSource,
        /\.party-balance-give[\s\S]*?color:\s*#16a34a/,
        "You Will Give must be green"
    );

    assert.match(
        cssSource,
        /\.party-balance-get[\s\S]*?color:\s*#dc2626/,
        "You Will Get must be red"
    );

    assert.match(
        cssSource,
        /\.party-balance-settled\s+\.party-balance-amount\s*\{[\s\S]*?color:\s*#ca8a04/,
        "Settled top balance amount must be yellow"
    );

    assert.match(
        cssSource,
        /#partyBalance\.party-balance-give\s*\{[\s\S]*?color:\s*#16a34a/,
        "Top You Will Give amount must be green"
    );

    assert.match(
        cssSource,
        /#partyBalance\.party-balance-get\s*\{[\s\S]*?color:\s*#dc2626/,
        "Top You Will Get amount must be red"
    );

    assert.match(
        cssSource,
        /#partyBalance\.party-balance-settled\s*\{[\s\S]*?color:\s*#ca8a04/,
        "Top Settled amount must be yellow"
    );

    assert.match(
        cssSource,
        /\.party-balance-settled[\s\S]*?color:\s*#ca8a04/,
        "Settled must be yellow"
    );

    assert.match(
        cssSource,
        /\.party-interest-positive[\s\S]*?color:\s*#16a34a/,
        "Positive INT must be green"
    );

    assert.match(
        cssSource,
        /\.party-interest-negative[\s\S]*?color:\s*#dc2626/,
        "Negative INT must be red"
    );
});

test("Ledger Party Detail hides party actions until the header is clicked", () => {
    const html = fs.readFileSync(
        require.resolve("../public/ledger/party.html"),
        "utf8"
    );

    assert.match(
        html,
        /id=["']partyHeaderActions["'][^>]*hidden/,
        "Party Edit/Delete actions must be hidden initially"
    );
});

test("Ledger Party Detail supports keyboard activation of party header actions", () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );

    assert.match(
        source,
        /partyHeaderDetails\.addEventListener\(["']keydown["']/,
        "Party header must support keyboard activation"
    );

    assert.match(
        source,
        /event\.key\s*===\s*["']Enter["']/,
        "Party header must respond to Enter"
    );

    assert.match(
        source,
        /event\.key\s*===\s*["'] ["']/,
        "Party header must respond to Space"
    );
});

test("Ledger Party Detail updates the party through the existing party API", () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );

    assert.match(
        source,
        /\/api\/ledger\/parties\/\$\{encodeURIComponent\(partyId\)\}/,
        "Party edit must target the selected party API"
    );

    assert.match(
        source,
        /method:\s*["']PUT["']/,
        "Party edit must use PUT"
    );

    assert.match(
        source,
        /name:\s*editPartyName\.value\.trim\(\)/,
        "Party edit must submit the edited name"
    );

    assert.match(
        source,
        /mobile:\s*editPartyMobile\.value\.trim\(\)/,
        "Party edit must submit the edited mobile"
    );

    assert.match(
        source,
        /address:\s*editPartyAddress\.value\.trim\(\)/,
        "Party edit must submit the edited address"
    );
});

test("Ledger Party Detail deactivates the party through the existing party API", () => {
    const source = fs.readFileSync(
        require.resolve("../public/ledger/js/party.js"),
        "utf8"
    );

    assert.match(
        source,
        /\/api\/ledger\/parties\/\$\{encodeURIComponent\(partyId\)\}/,
        "Party delete must target the selected party API"
    );

    assert.match(
        source,
        /method:\s*["']DELETE["']/,
        "Party delete must use DELETE"
    );

    assert.match(
        source,
        /confirm\(/,
        "Party delete must require confirmation"
    );
});
