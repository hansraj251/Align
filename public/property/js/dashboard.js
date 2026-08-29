let allProperties = [];
const API = "/api/property/listings";


const $ = id =>
    document.getElementById(id);


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const escapeHtml = value => {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

};


const formatPrice = (
    price,
    priceType
) => {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {

        return "Price on request";

    }


    const amount =
        Number(price);


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return "Price on request";

    }


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        amount
    );

};


/*
|--------------------------------------------------------------------------
| Property Card
|--------------------------------------------------------------------------
*/

const renderPropertyCard = listing => {

    const images =
        Array.isArray(
            listing.images
        )
            ? listing.images
            : [];


    const cover =
        images.find(
            image =>
                Number(
                    image.is_cover
                ) === 1
        ) ||
        images[0];


    let imageHtml = `
        <div
            class="
                property-card-placeholder
            "
        >
            🏠
        </div>
    `;


    if (
        cover &&
        cover.image_url
    ) {

        imageHtml = `
            <img
                src="${escapeHtml(
                    cover.image_url
                )}"
                alt="${escapeHtml(
                    listing.title ||
                    "Property"
                )}"
                class="property-card-image"
                onerror="
                    this.onerror=null;
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                class="
                    property-card-placeholder
                "
                style="display:none;"
            >
                🏠
            </div>
        `;

    }


    /*
    |--------------------------------------------------------------------------
    | Property Details URL
    |--------------------------------------------------------------------------
    */

    const detailsUrl =
        `/property/details.html?id=${encodeURIComponent(
            listing.id
        )}`;

    let displayPrice = "";

if (
    listing.rent_amount !== null &&
    listing.rent_amount !== undefined &&
    listing.rent_amount !== ""
) {

    displayPrice =
        `${formatPrice(
            listing.rent_amount
        )} / month`;

}
else if (
    listing.price !== null &&
    listing.price !== undefined &&
    listing.price !== ""
) {

    displayPrice =
        formatPrice(
            listing.price,
            listing.price_type
        );

}    


    return `
        <a
            href="${detailsUrl}"
            class="block no-underline"
            aria-label="View ${escapeHtml(
                listing.title ||
                "Property"
            )}"
        >

            <article
                class="
                    property-card
                    h-full
                    cursor-pointer
                    transition
                    duration-200
                    hover:-translate-y-1
                    hover:shadow-xl
                "
            >

                ${imageHtml}


                <div class="p-5">

                    <h2
                        class="
                            truncate
                            text-lg
                            font-bold
                            text-slate-900
                        "
                    >
                        ${escapeHtml(
                            listing.title ||
                            "Untitled Property"
                        )}
                    </h2>


                    ${
                        listing.subtitle
                            ? `
                                <p
                                    class="
                                        mt-1
                                        line-clamp-2
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


                    <div
                        class="
                            mt-4
                            text-xl
                            font-bold
                            text-slate-900
                        "
                    >
                        ${escapeHtml(
    displayPrice
)}
                    </div>

                </div>

            </article>

        </a>
    `;

};


/*
|--------------------------------------------------------------------------
| Authentication Button
|--------------------------------------------------------------------------
*/

const setupAuthButton = () => {

    const authButton =
        $("propertyAuthButton");


    if (!authButton) {
        return;
    }


    const token =
        localStorage.getItem(
            "propertyToken"
        );


    /*
    |--------------------------------------------------------------------------
    | Logged in
    |--------------------------------------------------------------------------
    */

    if (token) {

        authButton.textContent =
            "Logout";

        authButton.href =
            "#";


        authButton.onclick =
            event => {

                event.preventDefault();


                localStorage.removeItem(
                    "propertyToken"
                );

                localStorage.removeItem(
                    "propertyUser"
                );


                authButton.textContent =
                    "Login";

                authButton.href =
                    "/property/login.html";


                /*
                |--------------------------------------------------------------------------
                | Keep user on dashboard
                |--------------------------------------------------------------------------
                */

                window.location.reload();

            };


        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Logged out
    |--------------------------------------------------------------------------
    */

    authButton.textContent =
        "Login";

    authButton.href =
        "/property/login.html";

};


/*
|--------------------------------------------------------------------------
| Load Properties
|--------------------------------------------------------------------------
*/

const loadProperties =
    async () => {

        const loading =
            $("propertiesLoading");

        const errorBox =
            $("propertiesError");

        const empty =
            $("propertiesEmpty");

        const list =
            $("propertiesList");


        /*
        |--------------------------------------------------------------------------
        | Initial state
        |--------------------------------------------------------------------------
        */

        loading.classList.remove(
            "hidden"
        );

        errorBox.classList.add(
            "hidden"
        );

        empty.classList.add(
            "hidden"
        );

        list.classList.add(
            "hidden"
        );


        try {

            const response =
                await fetch(
                    API,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            console.log(
                "Property API response:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load properties."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | API response
            |--------------------------------------------------------------------------
            |
            | {
            |     success: true,
            |     listings: [...]
            | }
            |
            */

            const listings =
                Array.isArray(
                    data.listings
                )
                    ? data.listings
                    : [];


            loading.classList.add(
                "hidden"
            );
            allProperties = listings;

renderProperties(allProperties);


            /*
            |--------------------------------------------------------------------------
            | Empty
            |--------------------------------------------------------------------------
            */

            if (
                listings.length === 0
            ) {

                empty.classList.remove(
                    "hidden"
                );

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | Render
            |--------------------------------------------------------------------------
            */

            allProperties = listings;

renderProperties(
    allProperties
);


            list.classList.remove(
                "hidden"
            );


        }

        catch (error) {

            console.error(
                "Property listings error:",
                error
            );


            loading.classList.add(
                "hidden"
            );


            errorBox.textContent =
                error.message ||
                "Unable to load properties.";


            errorBox.classList.remove(
                "hidden"
            );

        }

    };

const renderProperties = listings => {

    const list =
        document.getElementById(
            "propertiesList"
        );

    const empty =
        document.getElementById(
            "propertiesEmpty"
        );

    const searchResult =
        document.getElementById(
            "propertySearchResult"
        );


    if (list) {

        list.innerHTML =
            listings
                .map(
                    listing =>
                        renderPropertyCard(
                            listing
                        )
                )
                .join("");

    }


    if (listings.length === 0) {

        list.classList.add(
            "hidden"
        );

        empty.classList.remove(
            "hidden"
        );

    }
    else {

        empty.classList.add(
            "hidden"
        );

        list.classList.remove(
            "hidden"
        );

    }


    if (searchResult) {

        searchResult.textContent =
            `${listings.length} ${
                listings.length === 1
                    ? "property"
                    : "properties"
            } found`;

        searchResult.classList.remove(
            "hidden"
        );

    }

};
const setupPropertySearch = () => {

    const searchInput =
        document.getElementById(
            "propertySearch"
        );

    const clearButton =
        document.getElementById(
            "clearPropertySearch"
        );


    if (!searchInput) {
        return;
    }


    const performSearch = () => {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!keyword) {

            clearButton?.classList.add(
                "hidden"
            );

            renderProperties(
                allProperties
            );

            return;

        }


        clearButton?.classList.remove(
            "hidden"
        );


        const filteredProperties =
            allProperties.filter(
                listing => {

                    const title =
                        String(
                            listing.title || ""
                        ).toLowerCase();

                    const subtitle =
                        String(
                            listing.subtitle || ""
                        ).toLowerCase();

                    const description =
                        String(
                            listing.description || ""
                        ).toLowerCase();


                    return (
                        title.includes(keyword) ||
                        subtitle.includes(keyword) ||
                        description.includes(keyword)
                    );

                }
            );


        renderProperties(
            filteredProperties
        );

    };


    searchInput.addEventListener(
        "input",
        performSearch
    );


    clearButton?.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            searchInput.focus();

            performSearch();

        }
    );

};    


/*
|--------------------------------------------------------------------------
| Initialisation
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupAuthButton();

setupPropertySearch();

loadProperties();

    }
);