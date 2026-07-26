const superAdminRepository =
    require("../repositories/superAdminRepository");
const staffSessionRepository =
    require("../repositories/staffSessionRepository"); 
const planRepository =
    require("../repositories/planRepository");    
const staffSessionAdminService =
    require("./staffSessionAdminService");     
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

        restaurant.active_devices =
            await staffSessionRepository
                .countActiveSessions(
                    restaurant.id
                );

    }

    return restaurants;

};
exports.getActiveSessions =
async (restaurantId) => {

    return await
        staffSessionRepository
            .getActiveSessions(
                restaurantId
            );

};

exports.forceLogout =
async (sessionId) => {


    return await
        staffSessionAdminService
            .forceLogout(
                sessionId
            );

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

    restaurant.active_devices =
        await staffSessionRepository
            .countActiveSessions(
                restaurant.id
            );

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