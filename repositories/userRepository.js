const db =
    require("../db");

exports.updatePassword =
    (
        email,
        passwordHash
    ) => {

        return new Promise(

            (
                resolve,
                reject
            ) => {

                db.run(

                    `
                    UPDATE users
                    SET password = ?
                    WHERE email = ?
                    `,

                    [
                        passwordHash,
                        email
                    ],

                    function (err) {

                        if (err) {

                            return reject(err);

                        }

                        resolve({

                            changes:
                                this.changes

                        });

                    }

                );

            }

        );

    };