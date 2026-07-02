const bcrypt =
    require("bcrypt");
const staffRepository =
    require("../repositories/staffRepository");

function generateStaffCode(lastCode) {

    if (!lastCode) {

        return "STF0001";

    }

    const number =
        Number(
            lastCode.replace("STF", "")
        ) + 1;

    return `STF${String(number).padStart(4, "0")}`;

}

exports.createStaff = async (
    restaurantId,
    staff
) => {
    if (!staff.username) {

    throw new Error(
        "Username is required"
    );

}

if (!staff.password) {

    throw new Error(
        "Password is required"
    );

}

    const last =
        await staffRepository.getLastStaffCode(
            restaurantId
        );

    const staffCode =
        generateStaffCode(
            last?.staff_code
        );
    const existing =

    await staffRepository.usernameExists(

        staff.username

    );

if (existing) {

    throw new Error(

        "Username already exists"

    );

}

const hashedPassword =

    await bcrypt.hash(

        staff.password,

        10

    );    

    const staffId =
    await staffRepository.createStaff(

        restaurantId,

        staffCode,

        staff.name,

        staff.mobile,

        staff.username,

        hashedPassword,

        staff.role,

        staff.salary_type,

        staff.basic_salary,

        staff.joining_date,

        staff.address,

        staff.emergency_contact,

        staff.status || "active"

    );

    return {

        success: true,

        message:
            "Staff created successfully",

        staffId,

        staffCode

    };

};

exports.getStaff = async (
    restaurantId
) => {

    const staff =
        await staffRepository.getStaff(
            restaurantId
        );

    return {

        success: true,

        staff

    };

};

exports.updateStaff = async (
    restaurantId,
    staffId,
    staff
) => {

    const changes =
        await staffRepository.updateStaff(

            restaurantId,

            staffId,

            staff.name,

            staff.mobile,
            staff.username,

            staff.role,

            staff.salary_type,

            staff.basic_salary,

            staff.joining_date,

            staff.address,

            staff.emergency_contact,

            staff.status

        );

    if (!changes) {

        throw new Error(
            "Staff not found"
        );

    }

    return {

        success: true,

        message:
            "Staff updated successfully"

    };

};

exports.deleteStaff = async (
    restaurantId,
    staffId
) => {

    const changes =
        await staffRepository.deleteStaff(
            restaurantId,
            staffId
        );

    if (!changes) {

        throw new Error(
            "Staff not found"
        );

    }

    return {

        success: true,

        message:
            "Staff deleted successfully"

    };

};