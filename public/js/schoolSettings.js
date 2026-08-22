Auth.requireSchoolOwner();

const settingsForm =
    document.getElementById(
        "settingsForm"
    );

const saveBtn =
    document.getElementById(
        "saveBtn"
    );

const result =
    document.getElementById(
        "result"
    );

async function loadSchoolSettings() {

    try {

        const data =
            await API.get(
                "/api/schools/me"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load school details"
            );

        }

        const school =
            data.school;

        document.getElementById(
            "schoolName"
        ).value =
            school.name || "";

        document.getElementById(
            "ownerName"
        ).value =
            school.owner_name || "";

        document.getElementById(
            "email"
        ).value =
            school.email || "";

        document.getElementById(
            "mobile"
        ).value =
            school.mobile || "";

        document.getElementById(
            "address"
        ).value =
            school.address || "";

        document.getElementById(
            "city"
        ).value =
            school.city || "";

        document.getElementById(
            "state"
        ).value =
            school.state || "";

        document.getElementById(
            "pincode"
        ).value =
            school.pincode || "";

    }
    catch (err) {

        console.error(err);

        result.textContent =
            err.message;

        result.className =
            "text-sm font-medium text-red-600";

    }

}

async function saveSettings() {

    result.textContent =
        "";

    saveBtn.disabled =
        true;

    saveBtn.textContent =
        "Saving...";

    try {

        const response =
            await API.put(
                "/api/schools/me",
                {
                    name:
                        document.getElementById(
                            "schoolName"
                        ).value.trim(),

                    ownerName:
                        document.getElementById(
                            "ownerName"
                        ).value.trim(),

                    mobile:
                        document.getElementById(
                            "mobile"
                        ).value.trim(),

                    address:
                        document.getElementById(
                            "address"
                        ).value.trim(),

                    city:
                        document.getElementById(
                            "city"
                        ).value.trim(),

                    state:
                        document.getElementById(
                            "state"
                        ).value.trim(),

                    pincode:
                        document.getElementById(
                            "pincode"
                        ).value.trim()
                }
            );

        if (
            !response.success
        ) {

            throw new Error(
                response.message ||
                "Unable to update school details"
            );

        }

        result.textContent =
            "School details updated successfully.";

        result.className =
            "text-sm font-medium text-emerald-600";

    }
    catch (err) {

        console.error(err);

        result.textContent =
            err.message;

        result.className =
            "text-sm font-medium text-red-600";

    }
    finally {

        saveBtn.disabled =
            false;

        saveBtn.textContent =
            "Save Changes";

    }

}

settingsForm.addEventListener(
    "submit",
    (
        event
    ) => {

        event.preventDefault();

        saveSettings();

    }
);

saveBtn.addEventListener(
    "click",
    (
        event
    ) => {

        event.preventDefault();

        saveSettings();

    }
);
document.getElementById(
    "logoutBtn"
)?.addEventListener(
    "click",
    () => {

        Auth.logout();

    }
);

loadSchoolSettings();