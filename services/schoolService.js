const schoolRepository =
    require("../repositories/schoolRepository");

exports.getSchool =
async (
    schoolId
) => {

    const school =
        await schoolRepository.getById(
            schoolId
        );

    if (
        !school
    ) {

        throw new Error(
            "School not found"
        );

    }

    return school;

};
