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

}



module.exports =
    runMigrations;