const alignAccountRepository =
    require("../repositories/alignAccountRepository");


const propertyAuthRepository =
    require("../repositories/propertyAuthRepository");

exports.getAccount =
async (
    accountId
) => {

    const account =
        await alignAccountRepository
            .getById(
                accountId
            );

    if (!account) {
        throw new Error(
            "Align account not found"
        );
    }

    if (account.status !== "active") {
        throw new Error(
            "Align account is not active"
        );
    }

    const moduleLinks =
        await alignAccountRepository
            .getModuleLinks(
                account.id
            );

    return {
        account,
        moduleLinks
    };
};

exports.getByEmail =
async (
    email
) => {

    const cleanEmail =
        String(
            email || ""
        )
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
        throw new Error(
            "Email is required"
        );
    }

    return await alignAccountRepository
        .getByEmail(
            cleanEmail
        );
};

exports.getByMobile =
async (
    mobile
) => {

    const cleanMobile =
        String(
            mobile || ""
        )
        .trim();

    if (!cleanMobile) {
        throw new Error(
            "Mobile is required"
        );
    }

    return await alignAccountRepository
        .getByMobile(
            cleanMobile
        );
};

exports.createAccount =
async (
    name,
    email,
    mobile,
    password
) => {

    const cleanName =
        String(
            name || ""
        ).trim();

    const cleanEmail =
        String(
            email || ""
        )
        .trim()
        .toLowerCase();

    const cleanMobile =
        String(
            mobile || ""
        ).trim();

    const cleanPassword =
        String(
            password || ""
        ).trim();

    if (!cleanName) {
        throw new Error(
            "Name is required"
        );
    }

    if (!cleanEmail && !cleanMobile) {
        throw new Error(
            "Email or mobile is required"
        );
    }

    if (!cleanPassword) {
        throw new Error(
            "Password is required"
        );
    }

    if (cleanEmail) {
        const existingEmail =
            await alignAccountRepository
                .getByEmail(
                    cleanEmail
                );

        if (existingEmail) {
            throw new Error(
                "Email already registered"
            );
        }
    }

    if (cleanMobile) {
        const existingMobile =
            await alignAccountRepository
                .getByMobile(
                    cleanMobile
                );

        if (existingMobile) {
            throw new Error(
                "Mobile already registered"
            );
        }
    }

    return await alignAccountRepository
        .create(
            cleanName,
            cleanEmail || null,
            cleanMobile || null,
            cleanPassword
        );
};

exports.linkModuleUser =
async (
    accountId,
    module,
    moduleUserId
) => {

    if (!accountId) {
        throw new Error(
            "Account ID is required"
        );
    }

    if (!module) {
        throw new Error(
            "Module is required"
        );
    }

    if (!moduleUserId) {
        throw new Error(
            "Module user ID is required"
        );
    }

    const account =
        await alignAccountRepository
            .getById(
                accountId
            );

    if (!account) {
        throw new Error(
            "Align account not found"
        );
    }

    return await alignAccountRepository
        .linkModuleUser(
            accountId,
            module,
            moduleUserId
        );
};

exports.ensureModuleAccount =

async (
    module,
    moduleUserId,
    name,
    email,
    mobile,
    passwordHash
) => {

    if (!module || !moduleUserId) {
        throw new Error(
            "Module and module user ID are required"
        );
    }

    const cleanName =
        String(name || "").trim();

    const cleanEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    const cleanMobile =
        String(mobile || "").trim();

    const cleanPasswordHash =
        String(passwordHash || "").trim();

    if (!cleanName) {
        throw new Error(
            "Account name is required"
        );
    }

    if (!cleanEmail && !cleanMobile) {
        throw new Error(
            "Account email or mobile is required"
        );
    }

    if (!cleanPasswordHash) {
        throw new Error(
            "Account password hash is required"
        );
    }

    return await alignAccountRepository
        .getModuleLink(
            module,
            moduleUserId
        )
        .then(async (existingLink) => {

            if (existingLink) {

                const account =
                    await alignAccountRepository
                        .getById(
                            existingLink.account_id
                        );

                if (!account) {
                    throw new Error(
                        "Linked Align account not found"
                    );
                }

                if (account.status !== "active") {
                    throw new Error(
                        "Linked Align account is not active"
                    );
                }

                return account;
            }

            const emailAccount =
                cleanEmail
                    ? await alignAccountRepository
                        .getByEmail(cleanEmail)
                    : null;

            const mobileAccount =
                cleanMobile
                    ? await alignAccountRepository
                        .getByMobile(cleanMobile)
                    : null;

            if (
                emailAccount &&
                mobileAccount &&
                emailAccount.id !== mobileAccount.id
            ) {
                throw new Error(
                    "Email and mobile belong to different Align accounts"
                );
            }

            const existingAccount =
                emailAccount ||
                mobileAccount;

            let account;

            if (existingAccount) {

                if (
                    existingAccount.status !== "active"
                ) {
                    throw new Error(
                        "Align account is not active"
                    );
                }

                account =
                    existingAccount;

            } else {

                account =
                    await alignAccountRepository
                        .create(
                            cleanName,
                            cleanEmail || null,
                            cleanMobile || null,
                            cleanPasswordHash
                        );
            }

            const conflictingLink =
                await alignAccountRepository
                    .getModuleLink(
                        module,
                        moduleUserId
                    );

            if (conflictingLink) {
                throw new Error(
                    "Align account link already exists"
                );
            }

            await alignAccountRepository
                .linkModuleUser(
                    account.id,
                    module,
                    moduleUserId
                );

            return account;
        });
};

exports.ensureFoodUser = async (
    accountId,
    name,
    email,
    mobile,
    passwordHash
) => {
    if (!accountId) {
        throw new Error("Align account ID is required");
    }

    const central =
        await exports.getAccount(
            accountId
        );

    const existingLink =
        central.moduleLinks.find(
            link => link.module === "food"
        );

    if (existingLink) {
        return existingLink.module_user_id;
    }

    if (!central.account.email) {
        throw new Error(
            "Email is missing from the Align account"
        );
    }

    if (!central.account.mobile) {
        throw new Error(
            "Mobile number is missing from the Align account. Please update your Align account first."
        );
    }

    const authSignupService =
        require("./authSignupService");

    const restaurantResult =
        await authSignupService
            .createRestaurantWorkspace({
                restaurantName:
                    central.account.name,
                ownerName:
                    central.account.name,
                email:
                    central.account.email,
                mobile:
                    central.account.mobile,
                passwordHash
            });

    await alignAccountRepository.linkModuleUser(
        accountId,
        "food",
        restaurantResult.userId
    );

    return restaurantResult.userId;
};

exports.ensureMusicUser = async (
    accountId,
    name,
    email,
    mobile,
    passwordHash
) => {
    if (!accountId) {
        throw new Error("Align account ID is required");
    }

    const central = await exports.getAccount(accountId);
    const existingLink = central.moduleLinks.find(
        link => link.module === "music"
    );

    if (existingLink) {
        return existingLink.module_user_id;
    }

    const musicUser =
        await alignAccountRepository.createMusicUser(
            name,
            email,
            mobile,
            passwordHash
        );

    await alignAccountRepository.linkModuleUser(
        accountId,
        "music",
        musicUser.id
    );

    return musicUser.id;
};

exports.ensurePropertyUser = async (
    accountId,
    name,
    email,
    mobile,
    passwordHash
) => {

    if (!accountId) {
        throw new Error(
            "Align account ID is required"
        );
    }

    const central =
        await exports.getAccount(
            accountId
        );

    const existingLink =
        central.moduleLinks.find(
            link =>
                link.module === "property"
        );

    if (existingLink) {
        return existingLink.module_user_id;
    }

    if (!central.account.email) {
        throw new Error(
            "Email is missing from the Align account"
        );
    }

    if (!central.account.mobile) {
        throw new Error(
            "Mobile number is missing from the Align account. Please update your Align account first."
        );
    }

    const propertyUser =
        await propertyAuthRepository.create(
            name ||
                central.account.name,
            central.account.email,
            central.account.mobile,
            passwordHash
        );

    await alignAccountRepository.linkModuleUser(
        accountId,
        "property",
        propertyUser.id
    );

    return propertyUser.id;
};

exports.resolveModuleAccount =
async (
    module,
    moduleUserId
) => {

    if (!module || !moduleUserId) {
        throw new Error(
            "Module and module user ID are required"
        );
    }

    const account =
        await alignAccountRepository
            .getLinkedAccount(
                module,
                moduleUserId
            );

    if (!account) {
        throw new Error(
            "Align account link not found"
        );
    }

    if (account.status !== "active") {
        throw new Error(
            "Align account is not active"
        );
    }

    return account;
};


exports.resolveLinkedPropertyUser =
async (
    moduleUserId
) => {
    if (!moduleUserId) {
        throw new Error(
            "Property user ID is required"
        );
    }

    const user =
        await propertyAuthRepository
            .getProfile(
                moduleUserId
            );

    if (!user) {
        throw new Error(
            "Linked Property user not found"
        );
    }

    if (user.status !== "active") {
        throw new Error(
            "Linked Property user is not active"
        );
    }

    return user;
};


exports.resolveLinkedModuleUser =
async (
    module,
    moduleUserId
) => {

    if (
        !module ||
        !moduleUserId
    ) {
        throw new Error(
            "Module and module user ID are required"
        );
    }

    const moduleLink =
        await alignAccountRepository
            .getModuleLink(
                module,
                moduleUserId
            );

    if (!moduleLink) {
        throw new Error(
            "Align account link not found"
        );
    }

    const authRepository =
        require("../repositories/authRepository");

    const user =
        await authRepository.getById(
            moduleUserId
        );

    if (!user) {
        throw new Error(
            "Linked module user not found"
        );
    }

    if (user.status !== "active") {
        throw new Error(
            "Linked module user is not active"
        );
    }

    return {
        moduleLink,
        user
    };
};


exports.loginAccount =
async (
    identifier,
    password
) => {

    const cleanIdentifier =
        String(
            identifier || ""
        ).trim();

    const cleanPassword =
        String(
            password || ""
        ).trim();

    if (
        !cleanIdentifier ||
        !cleanPassword
    ) {
        throw new Error(
            "Email/mobile and password are required"
        );
    }

    const cleanEmail =
        cleanIdentifier
            .toLowerCase();

    let account =
        await alignAccountRepository
            .getByEmail(
                cleanEmail
            );

    if (!account) {
        account =
            await alignAccountRepository
                .getByMobile(
                    cleanIdentifier
                );
    }

    if (!account) {
        throw new Error(
            "Invalid email/mobile or password"
        );
    }

    if (
        account.status !==
        "active"
    ) {
        throw new Error(
            "Your account is not active"
        );
    }

    const bcrypt =
        require("bcrypt");

    const matched =
        await bcrypt.compare(
            cleanPassword,
            account.password
        );

    if (!matched) {
        throw new Error(
            "Invalid email/mobile or password"
        );
    }

    const moduleLinks =
        await alignAccountRepository
            .getModuleLinks(
                account.id
            );

    return {
        account,
        moduleLinks
    };
};

exports.resetPassword = async (
    accountId,
    password
) => {
    const bcrypt = require("bcrypt");

    const cleanPassword =
        String(password || "").trim();

    if (!accountId) {
        throw new Error(
            "Account ID is required"
        );
    }

    if (!cleanPassword) {
        throw new Error(
            "Password is required"
        );
    }

    const passwordHash =
        await bcrypt.hash(
            cleanPassword,
            10
        );

    const account =
        await alignAccountRepository
            .getById(accountId);

    if (!account) {
        throw new Error(
            "Align account not found"
        );
    }

    if (account.status !== "active") {
        throw new Error(
            "Align account is not active"
        );
    }

    return await alignAccountRepository
        .updatePassword(
            accountId,
            passwordHash
        );
};
