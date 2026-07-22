const multer = require("multer");
const fs = require("fs");
const path = require("path");
const storage = multer.diskStorage({

    destination(req, file, cb) {

    const uploadPath =
        process.env.RENDER
            ? "/var/data/uploads/logos"
            : path.join(
                __dirname,
                "..",
                "uploads",
                "logos"
            );

    fs.mkdirSync(
        uploadPath,
        {
            recursive: true
        }
    );

    cb(
        null,
        uploadPath
    );

},

});

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp"
    ];

    if (
        allowed.includes(file.mimetype)
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only image files are allowed"
            )
        );

    }

};

module.exports = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            2 * 1024 * 1024

    }

});