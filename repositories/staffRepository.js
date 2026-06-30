const db = require("../db");

exports.createStaff = async (
    restaurantId,
    staffCode,
    name,
    mobile,
    role,
    salaryType,
    basicSalary,
    joiningDate,
    address,
    emergencyContact,
    status
) => {

    const result = await db.runAsync(
        `
        INSERT INTO staff
        (
            restaurant_id,
            staff_code,
            name,
            mobile,
            role,
            salary_type,
            basic_salary,
            joining_date,
            address,
            emergency_contact,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            restaurantId,
            staffCode,
            name,
            mobile,
            role,
            salaryType,
            basicSalary,
            joiningDate,
            address,
            emergencyContact,
            status
        ]
    );

    return result.lastID;

};

exports.getStaff = async (
    restaurantId
) => {

    return await db.allAsync(
        `
        SELECT *

        FROM staff

        WHERE restaurant_id = ?

        ORDER BY name
        `,
        [restaurantId]
    );

};

exports.updateStaff = async (
    restaurantId,
    staffId,
    name,
    mobile,
    role,
    salaryType,
    basicSalary,
    joiningDate,
    address,
    emergencyContact,
    status
) => {

    const result = await db.runAsync(
        `
        UPDATE staff
        SET

            name=?,

            mobile=?,

            role=?,

            salary_type=?,

            basic_salary=?,

            joining_date=?,

            address=?,

            emergency_contact=?,

            status=?,

            updated_at=CURRENT_TIMESTAMP

        WHERE

            id=?

            AND restaurant_id=?
        `,
        [

            name,

            mobile,

            role,

            salaryType,

            basicSalary,

            joiningDate,

            address,

            emergencyContact,

            status,

            staffId,

            restaurantId

        ]
    );

    return result.changes;

};

exports.deleteStaff = async (
    restaurantId,
    staffId
) => {

    const result = await db.runAsync(
        `
        DELETE
        FROM staff
        WHERE
            id = ?
            AND restaurant_id = ?
        `,
        [
            staffId,
            restaurantId
        ]
    );

    return result.changes;

};

exports.getLastStaffCode = async (
    restaurantId
) => {

    return await db.getAsync(
        `
        SELECT staff_code

        FROM staff

        WHERE restaurant_id = ?

        ORDER BY id DESC

        LIMIT 1
        `,
        [restaurantId]
    );

};