const db =
    require("../db");

const {

    ensureMigrationTable,

    hasRun,

    markAsRun

} = require("./migrationManager");

const migrations = [

    [
        "003_add_payment_columns",
        require("./003_add_payment_columns")
    ],

    [
        "004_add_table_snapshot",
        require("./004_add_table_snapshot")
    ],

    [
        "004_create_restaurant_settings",
        require("./004_create_restaurant_settings")
    ],

    [
        "006_create_dining_areas",
        require("./006_create_dining_areas")
    ],
    [
    "007_add_receipt_snapshot_columns",
    require(
        "./007_add_receipt_snapshot_columns"
    )
]

];

module.exports = async () => {

    console.log(
        "🚀 Running migrations..."
    );

    await ensureMigrationTable();

    for (const [

        name,

        migration

    ] of migrations) {

        if (
            await hasRun(name)
        ) {

            continue;

        }

        await migration(db);

        await markAsRun(name);

        console.log(
            `✓ ${name}`
        );

    }

    console.log(
        "✅ Migrations completed."
    );

};