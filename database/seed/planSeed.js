const db = require("../../db");

async function seedPlans() {

    const count =
        await db.getAsync(
            "SELECT COUNT(*) AS total FROM plans"
        );

    if (count.total > 0) {

        console.log(
            "✅ Plans already exist"
        );

        return;

    }

    await db.runAsync(
        `
        INSERT INTO plans
        (
            name,
            display_name,
            description
        )
        VALUES
        (?, ?, ?)
        `,
        [
            "plus",
            "Align Plus",
            "Ideal for single device restaurants"
        ]
    );

    await db.runAsync(
        `
        INSERT INTO plans
        (
            name,
            display_name,
            description
        )
        VALUES
        (?, ?, ?)
        `,
        [
            "pro",
            "Align Pro",
            "Ideal for multi-device restaurants"
        ]
    );

    console.log(
        "✅ Default plans created"
    );

}

module.exports = seedPlans;