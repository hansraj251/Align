const db =
    require("../db");

async function runMigrations() {

    console.log(
        "🔄 Running database migrations..."
    );

    /*
     * Migration 1:
     * subscription_orders.school_id
     */

    const subscriptionColumns =
        await db.allAsync(
            `
            PRAGMA table_info(
                subscription_orders
            )
            `
        );

    const hasSchoolId =
        subscriptionColumns.some(
            column =>
                column.name ===
                "school_id"
        );

    if (
        !hasSchoolId
    ) {

        console.log(
            "⚠️ Migrating subscription_orders..."
        );

        await db.runAsync(
            `
            PRAGMA foreign_keys = OFF
            `
        );

        await db.runAsync(
            `
            BEGIN TRANSACTION
            `
        );

        try {

            await db.runAsync(
                `
                CREATE TABLE subscription_orders_new (

                    id INTEGER PRIMARY KEY AUTOINCREMENT,

                    restaurant_id INTEGER,

                    school_id INTEGER,

                    plan_id INTEGER NOT NULL,

                    plan_pricing_id INTEGER NOT NULL,

                    razorpay_order_id TEXT NOT NULL UNIQUE,

                    razorpay_payment_id TEXT,

                    amount REAL NOT NULL,

                    currency TEXT NOT NULL,

                    duration_days INTEGER NOT NULL,

                    payment_method TEXT,

                    status TEXT DEFAULT 'pending',

                    paid_at DATETIME,

                    created_at DATETIME
                        DEFAULT CURRENT_TIMESTAMP,

                    FOREIGN KEY (restaurant_id)
                        REFERENCES restaurants(id),

                    FOREIGN KEY (school_id)
                        REFERENCES schools(id),

                    FOREIGN KEY (plan_id)
                        REFERENCES plans(id),

                    FOREIGN KEY (plan_pricing_id)
                        REFERENCES plan_pricing(id)

                )
                `
            );

            await db.runAsync(
                `
                INSERT INTO
                    subscription_orders_new
                SELECT
                    id,
                    restaurant_id,
                    NULL,
                    plan_id,
                    plan_pricing_id,
                    razorpay_order_id,
                    razorpay_payment_id,
                    amount,
                    currency,
                    duration_days,
                    payment_method,
                    status,
                    paid_at,
                    created_at
                FROM
                    subscription_orders
                `
            );

            await db.runAsync(
                `
                DROP TABLE
                    subscription_orders
                `
            );

            await db.runAsync(
                `
                ALTER TABLE
                    subscription_orders_new
                RENAME TO
                    subscription_orders
                `
            );

            await db.runAsync(
                `
                COMMIT
                `
            );

            console.log(
                "✅ subscription_orders migrated successfully."
            );

        }
        catch (err) {

            await db.runAsync(
                `
                ROLLBACK
                `
            );

            console.error(
                "❌ subscription_orders migration failed:",
                err.message
            );

            throw err;

        }
        finally {

            await db.runAsync(
                `
                PRAGMA foreign_keys = ON
                `
            );

        }

    }
    else {

        console.log(
            "✅ subscription_orders schema is up to date."
        );

    }


        /*
     * Migration 2:
     * users.username and users.school_id
     */

    const userColumns =
        await db.allAsync(
            `
            PRAGMA table_info(
                users
            )
            `
        );

    const hasUsername =
        userColumns.some(
            column =>
                column.name ===
                "username"
        );

    const hasUserSchoolId =
        userColumns.some(
            column =>
                column.name ===
                "school_id"
        );

    const userForeignKeys =
        await db.allAsync(
            `
            PRAGMA foreign_key_list(
                users
            )
            `
        );

    const hasSchoolForeignKey =
        userForeignKeys.some(
            foreignKey =>
                foreignKey.table ===
                "schools" &&
                foreignKey.from ===
                "school_id"
        );

    if (
        hasUsername &&
        hasUserSchoolId &&
        hasSchoolForeignKey
    ) {

        await db.runAsync(
            `
            CREATE UNIQUE INDEX
                IF NOT EXISTS
                idx_users_username
            ON users (
                username
            )
            `
        );

        console.log(
            "✅ users schema is up to date."
        );

    }
    else {

        console.log(
            "⚠️ Migrating users schema..."
        );

        await db.runAsync(
            `
            PRAGMA foreign_keys = OFF
            `
        );

        await db.runAsync(
            `
            BEGIN TRANSACTION
            `
        );

        try {

            const usernameExpression =
                hasUsername
                    ? "username"
                    : "NULL";

            const schoolIdExpression =
                hasUserSchoolId
                    ? "school_id"
                    : "NULL";

            await db.runAsync(
                `
                CREATE TABLE users_new (

                    id INTEGER PRIMARY KEY AUTOINCREMENT,

                    restaurant_id INTEGER,

                    school_id INTEGER,

                    name TEXT NOT NULL,

                    email TEXT UNIQUE,

                    mobile TEXT UNIQUE,

                    password TEXT NOT NULL,

                    role TEXT NOT NULL
                        DEFAULT 'owner',

                    status TEXT NOT NULL
                        DEFAULT 'active',

                    last_login DATETIME,

                    created_at DATETIME
                        DEFAULT CURRENT_TIMESTAMP,

                    updated_at DATETIME
                        DEFAULT CURRENT_TIMESTAMP,

                    username TEXT,

                    FOREIGN KEY (restaurant_id)
                        REFERENCES restaurants(id),

                    FOREIGN KEY (school_id)
                        REFERENCES schools(id)

                )
                `
            );

            await db.runAsync(
                `
                INSERT INTO
                    users_new (
                        id,
                        restaurant_id,
                        school_id,
                        name,
                        email,
                        mobile,
                        password,
                        role,
                        status,
                        last_login,
                        created_at,
                        updated_at,
                        username
                    )
                SELECT
                    id,
                    restaurant_id,
                    ${schoolIdExpression},
                    name,
                    email,
                    mobile,
                    password,
                    role,
                    status,
                    last_login,
                    created_at,
                    updated_at,
                    ${usernameExpression}
                FROM
                    users
                `
            );

            await db.runAsync(
                `
                DROP TABLE
                    users
                `
            );

            await db.runAsync(
                `
                ALTER TABLE
                    users_new
                RENAME TO
                    users
                `
            );

            await db.runAsync(
                `
                CREATE UNIQUE INDEX
                    IF NOT EXISTS
                    idx_users_username
                ON users (
                    username
                )
                `
            );

            await db.runAsync(
                `
                COMMIT
                `
            );

            console.log(
                "✅ users schema migrated successfully."
            );

        }
        catch (err) {

            await db.runAsync(
                `
                ROLLBACK
                `
            );

            console.error(
                "❌ users migration failed:",
                err.message
            );

            throw err;

        }
        finally {

            await db.runAsync(
                `
                PRAGMA foreign_keys = ON
                `
            );

        }

       }

    /*
     * Migration 3:
     * email_otps.business_type
     */

    const emailOtpColumns =
        await db.allAsync(
            `
            PRAGMA table_info(
                email_otps
            )
            `
        );

    const hasBusinessType =
        emailOtpColumns.some(
            column =>
                column.name ===
                "business_type"
        );

    if (
        hasBusinessType
    ) {

        console.log(
            "✅ email_otps schema is up to date."
        );

    }
    else {

        console.log(
            "⚠️ Adding email_otps.business_type..."
        );

        await db.runAsync(
            `
            ALTER TABLE
                email_otps
            ADD COLUMN
                business_type TEXT
            `
        );

        console.log(
            "✅ email_otps.business_type added successfully."
        );

    }
        /*
     * Migration 4:
     * plans.plan_type
     */

    const planColumns =
        await db.allAsync(
            `
            PRAGMA table_info(
                plans
            )
            `
        );

    const hasPlanType =
        planColumns.some(
            column =>
                column.name ===
                "plan_type"
        );

    if (
        hasPlanType
    ) {

        console.log(
            "✅ plans schema is up to date."
        );

    }
    else {

        console.log(
            "⚠️ Adding plans.plan_type..."
        );

        await db.runAsync(
            `
            ALTER TABLE
                plans
            ADD COLUMN
                plan_type TEXT NOT NULL
                DEFAULT 'food'
            `
        );

        console.log(
            "✅ plans.plan_type added successfully."
        );

    }
        /*
     * Migration 5:
     * salary_payments
     */

    await db.runAsync(
        `
        CREATE TABLE IF NOT EXISTS salary_payments (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            school_id INTEGER NOT NULL,

            teacher_id INTEGER NOT NULL,

            salary_month TEXT NOT NULL,

            salary_amount REAL NOT NULL,

            amount_paid REAL NOT NULL,

            payment_date DATE NOT NULL,

            payment_mode TEXT,

            reference_no TEXT,

            remarks TEXT,

            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (
                school_id
            )
                REFERENCES schools(id),

            FOREIGN KEY (
                teacher_id
            )
                REFERENCES teachers(id)

        )
        `
    );

    console.log(
        "✅ salary_payments schema is up to date."
    );
        /*
     * Migration 6:
     * fee_payments.fee_head
     */

    const feePaymentColumns =

        await db.allAsync(

            `
            PRAGMA table_info(
                fee_payments
            )
            `

        );

    const hasFeeHead =

        feePaymentColumns.some(

            column =>

                column.name ===
                "fee_head"

        );

    if (
        hasFeeHead
    ) {

        console.log(
            "✅ fee_payments schema is up to date."
        );

    }
    else {

        console.log(
            "⚠️ Adding fee_payments.fee_head..."
        );

        await db.runAsync(

            `
            ALTER TABLE
                fee_payments
            ADD COLUMN
                fee_head TEXT
            `

        );

        console.log(
            "✅ fee_payments.fee_head added successfully."
        );

    }
    /*
 * Migration 7:
 * fee_payment_items
 */

await db.runAsync(

    `
    CREATE TABLE IF NOT EXISTS fee_payment_items (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        payment_id INTEGER NOT NULL,

        fee_structure_id INTEGER NOT NULL,

        fee_head TEXT NOT NULL,

        amount REAL NOT NULL DEFAULT 0,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (payment_id)
            REFERENCES fee_payments(id)
            ON DELETE CASCADE,

        FOREIGN KEY (fee_structure_id)
            REFERENCES fee_structures(id)

    )
    `

);

console.log(
    "✅ fee_payment_items table ready."
);
    /*
     * Migration 8:
     * schools.receipt_footer_message
     */

    const schoolColumns =
        await db.allAsync(
            `
            PRAGMA table_info(
                schools
            )
            `
        );

    const hasReceiptFooterMessage =
        schoolColumns.some(
            column =>
                column.name ===
                "receipt_footer_message"
        );

    if (
        hasReceiptFooterMessage
    ) {

        console.log(
            "✅ schools.receipt_footer_message schema is up to date."
        );

    }
    else {

        console.log(
            "⚠️ Adding schools.receipt_footer_message..."
        );

        await db.runAsync(
            `
            ALTER TABLE
                schools
            ADD COLUMN
                receipt_footer_message TEXT
            `
        );

        console.log(
            "✅ schools.receipt_footer_message added successfully."
        );

    }


    const contactRequestColumns =
        await db.allAsync(
            `
            PRAGMA table_info(
                property_contact_requests
            )
            `
        );

    const hasContactShared =
        contactRequestColumns.some(
            column =>
                column.name ===
                "contact_shared"
        );

    if (
        !hasContactShared
    ) {

        console.log(
            "⚠️ Adding property_contact_requests.contact_shared..."
        );

        await db.runAsync(
            `
            ALTER TABLE
                property_contact_requests
            ADD COLUMN
                contact_shared INTEGER
                NOT NULL DEFAULT 0
            `
        );

        console.log(
            "✅ contact_shared added successfully."
        );

    }

    const hasContactSharedAt =
        contactRequestColumns.some(
            column =>
                column.name ===
                "contact_shared_at"
        );

    if (
        !hasContactSharedAt
    ) {

        console.log(
            "⚠️ Adding property_contact_requests.contact_shared_at..."
        );

        await db.runAsync(
            `
            ALTER TABLE
                property_contact_requests
            ADD COLUMN
                contact_shared_at DATETIME
            `
        );

        console.log(
            "✅ contact_shared_at added successfully."
        );

    }
        const contactRequestTokenColumns =
        await db.allAsync(
            `
            PRAGMA table_info(
                property_contact_requests
            )
            `
        );

    const hasBuyerAccessTokenHash =
        contactRequestTokenColumns.some(
            column =>
                column.name ===
                "buyer_access_token_hash"
        );

    if (
        !hasBuyerAccessTokenHash
    ) {

        console.log(
            "⚠️ Adding property_contact_requests.buyer_access_token_hash..."
        );

        await db.runAsync(
            `
            ALTER TABLE
                property_contact_requests
            ADD COLUMN
                buyer_access_token_hash TEXT
            `
        );

        console.log(
            "✅ buyer_access_token_hash added successfully."
        );

    }

    const hasBuyerAccessTokenExpiresAt =
        contactRequestTokenColumns.some(
            column =>
                column.name ===
                "buyer_access_token_expires_at"
        );

    if (
        !hasBuyerAccessTokenExpiresAt
    ) {

        console.log(
            "⚠️ Adding property_contact_requests.buyer_access_token_expires_at..."
        );

        await db.runAsync(
            `
            ALTER TABLE
                property_contact_requests
            ADD COLUMN
                buyer_access_token_expires_at DATETIME
            `
        );

        console.log(
            "✅ buyer_access_token_expires_at added successfully."
        );

    }
        /*
     * Migration 9:
     * Add property listing contact/rent fields
     */

    const propertyListingColumns =
        await db.allAsync(
            `
                PRAGMA table_info(
                    property_listings
                )
            `
        );

    const propertyListingColumnNames =
        new Set(
            propertyListingColumns.map(
                column => column.name
            )
        );

    if (
        !propertyListingColumnNames.has(
            "contact_preference"
        )
    ) {

        console.log(
            "⚠️ Adding property_listings.contact_preference..."
        );

        await db.runAsync(
            `
                ALTER TABLE
                    property_listings
                ADD COLUMN
                    contact_preference TEXT
                    NOT NULL
                    DEFAULT 'show'
            `
        );

        console.log(
            "✅ contact_preference added."
        );

    }

    if (
        !propertyListingColumnNames.has(
            "rent_amount"
        )
    ) {

        console.log(
            "⚠️ Adding property_listings.rent_amount..."
        );

        await db.runAsync(
            `
                ALTER TABLE
                    property_listings
                ADD COLUMN
                    rent_amount REAL
            `
        );

        console.log(
            "✅ rent_amount added."
        );

    }
        /*
     * Migration 10:
     * music_songs
     */

    await db.runAsync(
        `
        CREATE TABLE IF NOT EXISTS music_songs (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            youtube_video_id TEXT NOT NULL UNIQUE,

            title TEXT NOT NULL,

            artist TEXT,

            channel_title TEXT,

            thumbnail_url TEXT,

            duration TEXT,

            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP

        )
        `
    );

    console.log(
        "✅ music_songs table is ready."
    );

}

module.exports =
    runMigrations;