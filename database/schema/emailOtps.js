const db =
    require("../../db");

async function createEmailOtpsTable() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            db.run(
                `
                CREATE TABLE IF NOT EXISTS email_otps
                (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL,
                    otp TEXT NOT NULL,
                    restaurant_name TEXT NOT NULL,
                    owner_name TEXT NOT NULL,
                    mobile TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
                `,
                err => {

                    if (err) {

                        return reject(err);

                    }

                    resolve();

                }
            );

        }
    );

}

module.exports =
    createEmailOtpsTable;