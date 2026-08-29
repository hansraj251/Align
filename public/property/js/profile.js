/*
|--------------------------------------------------------------------------
| Align Properties - Seller Profile
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        */

        const token =
            localStorage.getItem(
                "propertyToken"
            );


        if (!token) {

            window.location.href =
                "/property/login.html?redirect=profile";

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | Elements
        |--------------------------------------------------------------------------
        */

        const form =
            document.getElementById(
                "profileForm"
            );

        const loading =
            document.getElementById(
                "profileLoading"
            );

        const errorBox =
            document.getElementById(
                "profileError"
            );

        const successBox =
            document.getElementById(
                "profileSuccess"
            );

        const nameInput =
            document.getElementById(
                "profileName"
            );

        const emailInput =
            document.getElementById(
                "profileEmail"
            );

        const mobileInput =
            document.getElementById(
                "profileMobile"
            );

        const saveButton =
            document.getElementById(
                "saveProfileBtn"
            );

        const saveText =
            document.getElementById(
                "saveProfileText"
            );

        const logoutButton =
            document.getElementById(
                "logoutBtn"
            );


        /*
        |--------------------------------------------------------------------------
        | Helpers
        |--------------------------------------------------------------------------
        */

        const showError =
            message => {

                errorBox.textContent =
                    message ||
                    "Something went wrong.";

                errorBox.classList.remove(
                    "hidden"
                );

                successBox.classList.add(
                    "hidden"
                );

            };


        const showSuccess =
            message => {

                successBox.textContent =
                    message ||
                    "Profile updated successfully.";

                successBox.classList.remove(
                    "hidden"
                );

                errorBox.classList.add(
                    "hidden"
                );

            };


        const clearMessages =
            () => {

                errorBox.classList.add(
                    "hidden"
                );

                successBox.classList.add(
                    "hidden"
                );

            };


        /*
        |--------------------------------------------------------------------------
        | Logout
        |--------------------------------------------------------------------------
        */

        logoutButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "propertyToken"
                );

                localStorage.removeItem(
                    "propertyUser"
                );

                window.location.href =
                    "/property/login.html";

            }
        );


        /*
        |--------------------------------------------------------------------------
        | Load Profile
        |--------------------------------------------------------------------------
        */

        const loadProfile =
            async () => {

                try {

                    const response =
                        await fetch(
                            "/api/property/auth/profile",
                            {
                                method: "GET",

                                headers: {
                                    "Accept":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                }
                            }
                        );


                    let data = {};

                    try {

                        data =
                            await response.json();

                    }

                    catch {

                        throw new Error(
                            "Invalid server response."
                        );

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Authentication expired
                    |--------------------------------------------------------------------------
                    */

                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {

                        localStorage.removeItem(
                            "propertyToken"
                        );

                        localStorage.removeItem(
                            "propertyUser"
                        );

                        window.location.href =
                            "/property/login.html?redirect=profile";

                        return;

                    }


                    if (
                        !response.ok ||
                        !data.success ||
                        !data.user
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to load profile."
                        );

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Populate form
                    |--------------------------------------------------------------------------
                    */

                    nameInput.value =
                        data.user.name ||
                        "";

                    emailInput.value =
                        data.user.email ||
                        "";

                    mobileInput.value =
                        data.user.mobile ||
                        "";


                    loading.classList.add(
                        "hidden"
                    );

                    form.classList.remove(
                        "hidden"
                    );

                }

                catch (error) {

                    console.error(
                        "Profile load error:",
                        error
                    );


                    loading.classList.add(
                        "hidden"
                    );

                    showError(
                        error.message ||
                        "Unable to load profile."
                    );

                }

            };


        /*
        |--------------------------------------------------------------------------
        | Update Profile
        |--------------------------------------------------------------------------
        */

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                clearMessages();


                const name =
                    nameInput.value.trim();

                const email =
                    emailInput.value.trim();

                const mobile =
                    mobileInput.value.trim();


                /*
                |--------------------------------------------------------------------------
                | Client validation
                |--------------------------------------------------------------------------
                */

                if (!name) {

                    showError(
                        "Name is required."
                    );

                    nameInput.focus();

                    return;

                }


                if (
                    name.length >
                    100
                ) {

                    showError(
                        "Name cannot exceed 100 characters."
                    );

                    nameInput.focus();

                    return;

                }


                if (
                    mobile &&
                    !/^[0-9+\-\s()]{7,20}$/.test(
                        mobile
                    )
                ) {

                    showError(
                        "Please enter a valid mobile number."
                    );

                    mobileInput.focus();

                    return;

                }


                /*
                |--------------------------------------------------------------------------
                | Disable button
                |--------------------------------------------------------------------------
                */

                saveButton.disabled =
                    true;

                saveText.textContent =
                    "Saving...";


                try {

                    const response =
                        await fetch(
                            "/api/property/auth/profile",
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Accept":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify({
                                        name,
                                        mobile
                                    })
                            }
                        );


                    let data = {};

                    try {

                        data =
                            await response.json();

                    }

                    catch {

                        throw new Error(
                            "Invalid server response."
                        );

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Authentication expired
                    |--------------------------------------------------------------------------
                    */

                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {

                        localStorage.removeItem(
                            "propertyToken"
                        );

                        localStorage.removeItem(
                            "propertyUser"
                        );

                        window.location.href =
                            "/property/login.html?redirect=profile";

                        return;

                    }


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to update profile."
                        );

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Update local user cache
                    |--------------------------------------------------------------------------
                    */

                    if (
                        data.user
                    ) {

                        localStorage.setItem(
                            "propertyUser",
                            JSON.stringify(
                                data.user
                            )
                        );

                    }


                    showSuccess(
                        data.message ||
                        "Profile updated successfully."
                    );

                }

                catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );


                    showError(
                        error.message ||
                        "Unable to update profile."
                    );

                }

                finally {

                    saveButton.disabled =
                        false;

                    saveText.textContent =
                        "Save Changes";

                }

            }
        );


        /*
        |--------------------------------------------------------------------------
        | Start
        |--------------------------------------------------------------------------
        */

        loadProfile();

    }
);