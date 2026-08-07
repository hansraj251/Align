const fs =
    require("fs");

const path =
    require("path");

const crypto =
    require("crypto");

const privateKey =
    fs.readFileSync(

        path.join(
            __dirname,
            "../keys/private.pem"
        ),

        "utf8"

    );

exports.sign =
    payload => {

        return crypto
            .sign(

                "sha256",

                Buffer.from(payload),

                privateKey

            )
            .toString(
                "base64"
            );

    };