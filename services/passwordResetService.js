const bcrypt =
    require("bcrypt");

const userRepository =
    require("../repositories/userRepository");

exports.resetPassword =
    async (
        email,
        password
    ) => {

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );

        const result =
            await userRepository.updatePassword(

                email,

                passwordHash

            );

        if (
            result.changes === 0
        ) {

            throw new Error(
                "User not found"
            );

        }

    };