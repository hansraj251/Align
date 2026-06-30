module.exports = async (db) => {

    const columns = [

        [
            "restaurant_name",
            "TEXT"
        ],

        [
            "restaurant_address",
            "TEXT"
        ],

        [
            "restaurant_phone",
            "TEXT"
        ],

        [
            "restaurant_email",
            "TEXT"
        ],

        [
            "restaurant_gst",
            "TEXT"
        ],

        [
            "restaurant_logo",
            "TEXT"
        ],

        [
            "receipt_footer",
            "TEXT"
        ],

        [
            "cgst",
            "REAL"
        ],

        [
            "sgst",
            "REAL"
        ]

    ];

    for (const [

        name,

        type

    ] of columns) {

        try {

            await db.runAsync(

                `ALTER TABLE orders ADD COLUMN ${name} ${type}`

            );

            console.log(
                `✓ Added ${name}`
            );

        } catch (err) {

            if (

                !err.message.includes(
                    "duplicate column name"
                )

            ) {

                throw err;

            }

        }

    }

};