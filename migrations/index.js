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
],
[
    "008_order_item_snapshot",
    require("./008_order_item_snapshot")
],
[
    "009_create_menu_item_variants",
    require(
        "./009_create_menu_item_variants"
    )
],
[
    "010_add_variant_snapshot_to_order_items",
    require(
        "./010_add_variant_snapshot_to_order_items"
    )
],
[
    "011_add_variant_to_kitchen_ticket_items",
    require(
        "./011_add_variant_to_kitchen_ticket_items"
    )
],
[
    "012_upgrade_staff_auth",
    require(
        "./012_upgrade_staff_auth"
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