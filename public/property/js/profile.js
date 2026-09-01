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
        const listingsLoading =
    document.getElementById(
        "listingsLoading"
    );

const listingsError =
    document.getElementById(
        "listingsError"
    );

const listingsEmpty =
    document.getElementById(
        "listingsEmpty"
    );

const listingsContainer =
    document.getElementById(
        "listingsContainer"
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
        const escapeHtml =
    value => {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);

        return div.innerHTML;

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
| Load My Listings
|--------------------------------------------------------------------------
*/

const loadMyListings =
    async () => {

        try {

            const response =
                await fetch(
                    "/api/property/listings/mine",
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
| Delete Listing
|--------------------------------------------------------------------------
*/

const deleteListing =
    async (
        listingId,
        listingTitle
    ) => {

        Modal.confirm(

            "Delete Property",

            `
                <p class="text-slate-600">
                    Are you sure you want to delete
                    <span class="font-semibold text-slate-800">
                        "${escapeHtml(listingTitle)}"
                    </span>
                    ?
                </p>

                <p class="mt-2 text-sm text-red-600">
                    This action cannot be undone.
                </p>
            `,

            async () => {

                const response =
                    await fetch(
                        `/api/property/listings/${encodeURIComponent(
                            listingId
                        )}`,
                        {
                            method: "DELETE",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`,

                                "Accept":
                                    "application/json"
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

                    Modal.close();

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
                        "Unable to delete property."
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | Close modal
                |--------------------------------------------------------------------------
                */

                Modal.close();
                Toast.show(
    "Property deleted successfully.",
    "success"
);


                /*
                |--------------------------------------------------------------------------
                | Reload listings
                |--------------------------------------------------------------------------
                */

                await loadMyListings();

            },

            {
                buttonText:
                    "Delete",

                buttonClass:
                    "bg-red-600 hover:bg-red-700",

                loadingText:
                    "Deleting..."
            }

        );

    };
    
    listingsContainer.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".delete-listing-btn"
            );

        if (!button) {
            return;
        }


        const listingId =
            button.dataset.listingId;

        const listingTitle =
            button.dataset.listingTitle ||
            "this property";


        deleteListing(
            listingId,
            listingTitle
        );

    }
);

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
                    "Unable to load your listings."
                );

            }


            const listings =
                Array.isArray(
                    data.listings
                )
                    ? data.listings
                    : [];


            listingsLoading.classList.add(
                "hidden"
            );


            /*
            |--------------------------------------------------------------------------
            | Empty
            |--------------------------------------------------------------------------
            */

          if (
    listings.length === 0
) {

    listingsContainer.innerHTML = "";

    listingsContainer.classList.add(
        "hidden"
    );

    listingsEmpty.classList.remove(
        "hidden"
    );

    return;

}


            /*
            |--------------------------------------------------------------------------
            | Render Listings
            |--------------------------------------------------------------------------
            */

            listingsContainer.innerHTML =
                listings
                    .map(
                        listing =>
                            renderListing(
                                listing
                            )
                    )
                    .join("");


            listingsContainer.classList.remove(
                "hidden"
            );

        }
        catch (error) {

            console.error(
                "My listings load error:",
                error
            );

            listingsLoading.classList.add(
                "hidden"
            );

            listingsError.textContent =
                error.message ||
                "Unable to load your listings.";

            listingsError.classList.remove(
                "hidden"
            );

        }

    };
    /*
|--------------------------------------------------------------------------
| Render Listing
|--------------------------------------------------------------------------
*/

const renderListing =
    listing => {

        const isRent =
            listing.rent_amount !== null &&
            listing.rent_amount !== undefined &&
            listing.rent_amount !== "";


        const type =
            isRent
                ? "For Rent"
                : "For Sale";


        const amount =
            isRent
                ? `₹${Number(
                    listing.rent_amount
                ).toLocaleString("en-IN")} / month`
                : listing.price !== null &&
                  listing.price !== undefined &&
                  listing.price !== ""
                    ? `₹${Number(
                        listing.price
                    ).toLocaleString("en-IN")}`
                    : "Price on request";


        const status =
            String(
                listing.status ||
                "published"
            )
                .replace(
                    /_/g,
                    " "
                )
                .replace(
                    /\b\w/g,
                    char =>
                        char.toUpperCase()
                );


        const statusClass =
            String(
                listing.status
            ).toLowerCase() ===
            "sold"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700";


        const createdDate =
            listing.created_at
                ? new Date(
                    listing.created_at
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "";


        return `
            <div
                class="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                "
            >

                <div
                    class="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >

                    <div class="min-w-0">

                        <div
                            class="
                                mb-2
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >

                            <span
                                class="
                                    rounded-full
                                    bg-indigo-50
                                    px-3
                                    py-1
                                    text-xs
                                    font-semibold
                                    text-indigo-700
                                "
                            >
                                ${type}
                            </span>

                            <span
                                class="
                                    rounded-full
                                    px-3
                                    py-1
                                    text-xs
                                    font-semibold
                                    ${statusClass}
                                "
                            >
                                ${status}
                            </span>

                        </div>


                        <h3
                            class="
                                text-lg
                                font-bold
                                text-slate-800
                            "
                        >
                            ${escapeHtml(
                                listing.title ||
                                "Untitled Property"
                            )}
                        </h3>


                        ${
                            listing.subtitle
                                ? `
                                    <p
                                        class="
                                            mt-1
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        ${escapeHtml(
                                            listing.subtitle
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        <p
                            class="
                                mt-3
                                text-base
                                font-bold
                                text-slate-800
                            "
                        >
                            ${amount}
                        </p>


                        ${
                            createdDate
                                ? `
                                    <p
                                        class="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Listed on ${createdDate}
                                    </p>
                                `
                                : ""
                        }

                    </div>


                    <div class="flex shrink-0 flex-wrap gap-2">

    <a
        href="/property/edit.html?id=${encodeURIComponent(
            listing.id
        )}"
        class="
            inline-flex
            items-center
            justify-center
            rounded-xl
            bg-indigo-50
            px-4
            py-2.5
            text-sm
            font-semibold
            text-indigo-700
            hover:bg-indigo-100
        "
    >
        Edit
    </a>

    <button
        type="button"
        class="
            delete-listing-btn
            inline-flex
            items-center
            justify-center
            rounded-xl
            bg-red-50
            px-4
            py-2.5
            text-sm
            font-semibold
            text-red-700
            hover:bg-red-100
        "
        data-listing-id="${listing.id}"
        data-listing-title="${escapeHtml(
            listing.title || "this property"
        )}"
    >
        Delete
    </button>

    <a
        href="/property/details.html?id=${encodeURIComponent(
            listing.id
        )}"
        class="
            inline-flex
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            hover:bg-slate-50
        "
    >
        View
    </a>

</div>

                </div>

            </div>
        `;

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
        loadMyListings();

    }
);