const db = require("../db");
const alignAccountService = require("./alignAccountService");

exports.createWorkspace = async (
    alignAccountId,
    schoolName,
    ownerName,
    mobile,
    address,
    city,
    state,
    pincode,
    passwordHash
) => {

    if (!alignAccountId) {
        throw new Error("Align account is required");
    }

    const cleanSchoolName =
        String(schoolName || "").trim();

    const cleanOwnerName =
        String(ownerName || "").trim();

    const cleanMobile =
        String(mobile || "").trim();

    const cleanAddress =
        String(address || "").trim();

    const cleanCity =
        String(city || "").trim();

    const cleanState =
        String(state || "").trim();

    const cleanPincode =
        String(pincode || "").trim();

    if (!cleanSchoolName) {
        throw new Error("School name is required");
    }

    if (!cleanOwnerName) {
        throw new Error("Owner name is required");
    }

    if (!cleanMobile) {
        throw new Error("Mobile number is required");
    }

    if (!passwordHash) {
        throw new Error("Central account password hash is required");
    }

    const central =
        await alignAccountService.getAccount(
            alignAccountId
        );

    const account =
        central.account;

    const accountEmail =
        account.email || null;

    const accountMobile =
        String(account.mobile || "").trim();

    if (!accountMobile) {
        throw new Error(
            "Mobile number is missing from the Align account. Please update your Align account first."
        );
    }

    const existingSchoolLink =
        central.moduleLinks.find(
            link => link.module === "school"
        );

    if (existingSchoolLink) {
        throw new Error(
            "This Align account already has a School workspace"
        );
    }

    return await db.transaction(
        async () => {

            const schoolPlan =
                await db.getAsync(
                    `
                    SELECT
                        id,
                        slug,
                        display_name
                    FROM plans
                    WHERE
                        plan_type = 'school'
                        AND status = 'active'
                    ORDER BY
                        sort_order,
                        id
                    LIMIT 1
                    `
                );

            if (!schoolPlan) {
                throw new Error(
                    "No active School plan is configured"
                );
            }

            const schoolResult =
                await db.runAsync(
                    `
                    INSERT INTO schools
                    (
                        name,
                        owner_name,
                        email,
                        mobile,
                        address,
                        city,
                        state,
                        pincode,
                        status,
                        plan_id,
                        subscription_status,
                        plan_start,
                        plan_end
                    )
                    VALUES
                    (
                        ?, ?, ?, ?, ?, ?, ?, ?,
                        'active',
                        ?,
                        'trial',
                        DATE('now'),
                        DATE('now', '+30 days')
                    )
                    `,
                    [
                        cleanSchoolName,
                        cleanOwnerName,
                        accountEmail,
                        accountMobile,
                        cleanAddress || null,
                        cleanCity || null,
                        cleanState || null,
                        cleanPincode || null,
                        schoolPlan.id
                    ]
                );

            const schoolId =
                schoolResult.lastID;

            const schoolCode =
                `SCH${String(schoolId).padStart(6, "0")}`;

            await db.runAsync(
                `
                UPDATE schools
                SET school_code = ?
                WHERE id = ?
                `,
                [
                    schoolCode,
                    schoolId
                ]
            );

            const userResult =
                await db.runAsync(
                    `
                    INSERT INTO users
                    (
                        school_id,
                        name,
                        email,
                        mobile,
                        password,
                        role,
                        status
                    )
                    VALUES
                    (
                        ?, ?, NULL, NULL, ?, 'owner', 'active'
                    )
                    `,
                    [
                        schoolId,
                        cleanOwnerName,
                        passwordHash
                    ]
                );

            const userId =
                userResult.lastID;

            await db.runAsync(
                `
                INSERT INTO align_account_links
                (
                    account_id,
                    module,
                    module_user_id
                )
                VALUES
                (?, 'school', ?)
                `,
                [
                    account.id,
                    userId
                ]
            );

            return {
                schoolId,
                schoolCode,
                userId,
                planId: schoolPlan.id,
                planSlug: schoolPlan.slug,
                planName: schoolPlan.display_name
            };
        }
    );
};
