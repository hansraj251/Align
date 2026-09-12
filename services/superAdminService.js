const superAdminRepository =
    require("../repositories/superAdminRepository");

const planRepository =
    require("../repositories/planRepository");    
const subscriptionOrderRepository =
require("../repositories/subscriptionOrderRepository");    
   
const fs =
    require("fs");

const path =
    require("path");

const archiver =
    require("archiver");      

exports.getDashboardStats =
async () => {

    return await
        superAdminRepository
            .getDashboardStats();

};

exports.getRestaurants =
async () => {

    const restaurants =
        await superAdminRepository
            .getRestaurants();

    for (const restaurant of restaurants) {

    }

    return restaurants;

};
exports.getSchools =

async () => {

    const schools =
        await superAdminRepository
            .getSchools();

    return schools;

};
exports.getPaymentHistory =
async () => {

    return await subscriptionOrderRepository
        .getPaymentHistory();

};

exports.getRestaurantById =
async (restaurantId) => {

    const restaurant =
        await superAdminRepository
            .getRestaurantById(
                restaurantId
            );

    if (!restaurant) {

        return null;

    }

    return restaurant;

};

exports.updateRestaurantSubscription =
async (

    restaurantId,

    planId,

    status,

    days

) => {

    if (!planId) {

        throw new Error(
            "Please select a plan."
        );

    }

    const plan =
    await planRepository
        .getById(
            planId
        );

    if (!plan) {

        throw new Error(
            "Plan not found."
        );

    }

   if (
    Number(days) < 1
) {

    throw new Error(
        "Validity days must be greater than zero."
    );

} 

    await superAdminRepository
        .updateRestaurantSubscription(

            restaurantId,

            planId,

            status,

            Number(days)

        );

};
exports.createDatabaseBackup =
async () => {

    const dbPath =
        process.env.RENDER
            ? "/var/data/align.db"
            : path.join(
                __dirname,
                "..",
                "database",
                "align.db"
            );

    if (
        !fs.existsSync(
            dbPath
        )
    ) {

        throw new Error(
            "Database not found."
        );

    }

    const backupDir =
        path.join(
            __dirname,
            "..",
            "backups"
        );

    if (
        !fs.existsSync(
            backupDir
        )
    ) {

        fs.mkdirSync(
            backupDir,
            {
                recursive: true
            }
        );

    }

    const timestamp =
        new Date()
            .toISOString()
            .replace(/:/g, "-")
            .replace(/\..+/, "");

    const fileName =
        `align-backup-${timestamp}.zip`;

    const filePath =
        path.join(
            backupDir,
            fileName
        );

    await new Promise(

        (
            resolve,
            reject
        ) => {

            const output =
                fs.createWriteStream(
                    filePath
                );

            const archive =
                archiver(
                    "zip",
                    {
                        zlib: {
                            level: 9
                        }
                    }
                );

            output.on(
                "close",
                resolve
            );

            output.on(
                "error",
                reject
            );

            archive.on(
                "error",
                reject
            );

            archive.pipe(
                output
            );

            archive.file(
                dbPath,
                {
                    name:
                        "align.db"
                }
            );

            archive.finalize();

        }

    );

    return {

        fileName,

        filePath

    };

};
exports.getSchoolById =

async (

    schoolId

) => {

    const school =
        await superAdminRepository
            .getSchoolById(
                schoolId
            );

    if (
        !school
    ) {

        return null;

    }

    return school;

};


exports.updateSchoolSubscription =

async (

    schoolId,

    planId,

    status,

    days

) => {

    if (
        !planId
    ) {

        throw new Error(
            "Please select a plan."
        );

    }

    const plan =
        await planRepository
            .getById(
                planId
            );

    if (
        !plan
    ) {

        throw new Error(
            "Plan not found."
        );

    }

    if (
        plan.plan_type !==
        "school"
    ) {

        throw new Error(
            "Please select a valid school plan."
        );

    }

    if (
        Number(days) < 1
    ) {

        throw new Error(
            "Validity days must be greater than zero."
        );

    }

    await superAdminRepository
        .updateSchoolSubscription(

            schoolId,

            planId,

            status,

            Number(days)

        );

};
exports.restoreDatabaseBackup = async (uploadedFile) => {
    if (!uploadedFile || !uploadedFile.buffer) {
        throw new Error("Backup ZIP file is required.");
    }

    const AdmZip = require("adm-zip");

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    const dbPath =
        process.env.RENDER
            ? "/var/data/align.db"
            : path.join(__dirname, "..", "database", "align.db");

    const backupsDir =
        path.join(__dirname, "..", "backups");

    const tempDir =
        path.join(backupsDir, `.restore-${timestamp}`);

    const tempDbPath =
        path.join(tempDir, "align.db");

    const safetyBackupPath =
        path.join(
            backupsDir,
            `align-before-restore-${timestamp}.db`
        );

    try {
        fs.mkdirSync(tempDir, {
            recursive: true
        });

        const zip = new AdmZip(uploadedFile.buffer);
        const entries = zip.getEntries();

        if (!entries.length) {
            throw new Error("The uploaded ZIP file is empty.");
        }

        const invalidEntries = entries.filter(entry => {
            const name = entry.entryName;

            return (
                entry.isDirectory ||
                name !== "align.db"
            );
        });

        if (invalidEntries.length > 0) {
            throw new Error(
                "Invalid backup ZIP. The archive must contain only align.db."
            );
        }

        const dbEntry = entries.find(
            entry => entry.entryName === "align.db"
        );

        if (!dbEntry) {
            throw new Error(
                "Invalid backup ZIP. align.db was not found."
            );
        }

        fs.writeFileSync(
            tempDbPath,
            dbEntry.getData()
        );

        const sqlite3 =
            require("sqlite3").verbose();

        await new Promise((resolve, reject) => {
            const testDb =
                new sqlite3.Database(
                    tempDbPath,
                    sqlite3.OPEN_READONLY,
                    err => {
                        if (err) {
                            return reject(
                                new Error(
                                    `Restored database could not be opened: ${err.message}`
                                )
                            );
                        }

                        testDb.get(
                            "PRAGMA integrity_check;",
                            (checkErr, row) => {
                                testDb.close(() => {});

                                if (checkErr) {
                                    return reject(
                                        new Error(
                                            `Database integrity check failed: ${checkErr.message}`
                                        )
                                    );
                                }

                                if (
                                    !row ||
                                    row.integrity_check !== "ok"
                                ) {
                                    return reject(
                                        new Error(
                                            "Database integrity check failed."
                                        )
                                    );
                                }

                                resolve();
                            }
                        );
                    }
                );
        });

        const db = require("../db");

        await db.closeAsync();

        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(
                dbPath,
                safetyBackupPath
            );
        }

        fs.renameSync(
            tempDbPath,
            dbPath
        );

        return {
            safetyBackupPath
        };

    } finally {
        fs.rmSync(
            tempDir,
            {
                recursive: true,
                force: true
            }
        );
    }
};
