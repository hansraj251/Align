const test = require("node:test");
const assert = require("node:assert/strict");

test("database init does not run automatically when required", async () => {
    const originalCatch = Promise.prototype.catch;
    let catchCalled = false;

    Promise.prototype.catch = function (...args) {
        catchCalled = true;
        return originalCatch.apply(this, args);
    };

    try {
        delete require.cache[
            require.resolve("../database/init")
        ];

        const initializeDatabase =
            require("../database/init");

        assert.equal(
            typeof initializeDatabase,
            "function"
        );

        await new Promise(resolve =>
            setImmediate(resolve)
        );

        assert.equal(
            catchCalled,
            false,
            "database initialization must not auto-start when init.js is required"
        );
    } finally {
        Promise.prototype.catch = originalCatch;
    }
});
