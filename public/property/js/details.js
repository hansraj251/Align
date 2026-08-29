document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const loading =
            document.getElementById(
                "propertyLoading"
            );

        const errorBox =
            document.getElementById(
                "propertyError"
            );

        const details =
            document.getElementById(
                "propertyDetails"
            );

        const imageContainer =
            document.getElementById(
                "propertyImageContainer"
            );

        const title =
            document.getElementById(
                "propertyTitle"
            );

        const subtitle =
            document.getElementById(
                "propertySubtitle"
            );

        
        const salePriceElement =
            document.getElementById(
                  "propertySalePrice"
            );

        const salePriceTypeElement =
            document.getElementById(
               "propertySalePriceType"
            );

const rentElement =
    document.getElementById(
        "propertyRent"
    );    

        const description =
            document.getElementById(
                "propertyDescription"
            );

        const contactSection =
            document.getElementById(
                "contactSection"
            );


        const params =
            new URLSearchParams(
                window.location.search
            );

        const listingId =
            params.get("id");


        if (!listingId) {

            loading.classList.add(
                "hidden"
            );

            errorBox.textContent =
                "Property ID is missing.";

            errorBox.classList.remove(
                "hidden"
            );

            return;

        }


        const escapeHtml =
            value => {

                return String(
                    value ?? ""
                )
                    .replaceAll(
                        "&",
                        "&amp;"
                    )
                    .replaceAll(
                        "<",
                        "&lt;"
                    )
                    .replaceAll(
                        ">",
                        "&gt;"
                    )
                    .replaceAll(
                        '"',
                        "&quot;"
                    )
                    .replaceAll(
                        "'",
                        "&#039;"
                    );

            };


        const formatPrice =
            value => {

                if (
                    value === null ||
                    value === undefined ||
                    value === ""
                ) {

                    return "Price on request";

                }


                const amount =
                    Number(
                        value
                    );


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


        try {

            const response =
                await fetch(
                    `/api/property/listings/public/${encodeURIComponent(listingId)}`,
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


            if (
                !response.ok ||
                !data.success ||
                !data.listing
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load property."
                );

            }


            const listing =
                data.listing;
            console.log(
    "PROPERTY DEBUG:",
    listing,
    "SALE ELEMENT:",
    salePriceElement,
    "RENT ELEMENT:",
    rentElement
);    


            title.textContent =
                listing.title ||
                "Untitled Property";


            subtitle.textContent =
                listing.subtitle ||
                "";


            if (
                !listing.subtitle
            ) {

                subtitle.classList.add(
                    "hidden"
                );

            }


         /*
|--------------------------------------------------------------------------
| Pricing
|--------------------------------------------------------------------------
*/

const hasSalePrice =
    listing.price !== null &&
    listing.price !== undefined &&
    listing.price !== "";

const hasRentAmount =
    listing.rent_amount !== null &&
    listing.rent_amount !== undefined &&
    listing.rent_amount !== "";


/*
|--------------------------------------------------------------------------
| Sale Price
|--------------------------------------------------------------------------
*/

if (hasSalePrice) {

    salePriceElement.textContent =
        formatPrice(
            listing.price
        );

    /*
    | Make sure Sale Price is visible
    */

    salePriceElement.classList.remove(
        "hidden"
    );


    /*
    | Rent must be hidden
    */

    rentElement.classList.add(
        "hidden"
    );


    /*
    |--------------------------------------------------------------------------
    | Price Type
    |--------------------------------------------------------------------------
    */

    if (
        listing.price_type === "negotiable"
    ) {

        salePriceTypeElement.textContent =
            "Negotiable";

        salePriceTypeElement.classList.remove(
            "hidden"
        );

    }
    else {

        salePriceTypeElement.textContent =
            "";

        salePriceTypeElement.classList.add(
            "hidden"
        );

    }

}


/*
|--------------------------------------------------------------------------
| Rent
|--------------------------------------------------------------------------
*/

else if (hasRentAmount) {

    /*
    | Hide Sale Price
    */

    salePriceElement.classList.add(
        "hidden"
    );

    salePriceTypeElement.classList.add(
        "hidden"
    );


    /*
    | Show Rent
    */

    rentElement.textContent =
        `${formatPrice(
            listing.rent_amount
        )} / month`;

    rentElement.classList.remove(
        "hidden"
    );

}


/*
|--------------------------------------------------------------------------
| Neither Sale Price nor Rent
|--------------------------------------------------------------------------
*/

else {

    salePriceElement.classList.add(
        "hidden"
    );

    salePriceTypeElement.classList.add(
        "hidden"
    );

    rentElement.classList.add(
        "hidden"
    );

}


            description.textContent =
                listing.description ||
                "No description available.";


            /*
|--------------------------------------------------------------------------
| Property Image Gallery
|--------------------------------------------------------------------------
*/

const images =
    Array.isArray(
        listing.images
    )
        ? listing.images
        : [];


if (
    images.length > 0
) {

    const sortedImages =
        [...images].sort(
            (a, b) => {

                const coverA =
                    Number(a.is_cover) === 1
                        ? 0
                        : 1;

                const coverB =
                    Number(b.is_cover) === 1
                        ? 0
                        : 1;

                if (
                    coverA !== coverB
                ) {
                    return coverA - coverB;
                }

                return (
                    Number(a.sort_order || 0) -
                    Number(b.sort_order || 0)
                );

            }
        );


    const firstImage =
        sortedImages[0];


    imageContainer.innerHTML = `

    <!-- Main Image -->

    <div class="property-main-image-box">

        <img
            id="propertyMainImage"
            src="${escapeHtml(
                firstImage.image_url
            )}"
            alt="${escapeHtml(
                listing.title ||
                "Property"
            )}"
            class="property-main-image"
            onerror="
                this.onerror=null;
                this.style.display='none';
                document
                    .getElementById(
                        'propertyMainImagePlaceholder'
                    )
                    ?.classList.remove('hidden');
            "
        >

    </div>


    <!-- Thumbnails -->

    ${
        sortedImages.length > 1
            ? `

                <div class="property-thumbnails">

                    ${
                        sortedImages
                            .map(
                                (
                                    image,
                                    index
                                ) => `

                                    <button
                                        type="button"
                                        class="
                                            property-thumbnail
                                            flex-shrink-0
                                            overflow-hidden
                                            rounded-xl
                                            border-2
                                            ${
                                                index === 0
                                                    ? "border-indigo-600"
                                                    : "border-transparent"
                                            }
                                        "
                                        data-image-url="${escapeHtml(
                                            image.image_url
                                        )}"
                                        data-image-index="${index}"
                                    >

                                        <img
                                            src="${escapeHtml(
                                                image.image_url
                                            )}"
                                            alt="${escapeHtml(
                                                listing.title ||
                                                "Property"
                                            )} image ${index + 1}"
                                            class="property-thumbnail-image"
                                            onerror="
                                                this.style.opacity='0.3';
                                            "
                                        >

                                    </button>

                                `
                            )
                            .join("")
                    }

                </div>

            `
            : ""
    }

`;


    /*
    |--------------------------------------------------------------------------
    | Thumbnail Click
    |--------------------------------------------------------------------------
    */

    const mainImage =
        document.getElementById(
            "propertyMainImage"
        );


    const thumbnails =
        imageContainer.querySelectorAll(
            ".property-thumbnail"
        );


    thumbnails.forEach(
        thumbnail => {

            thumbnail.addEventListener(
                "click",
                () => {

                    const imageUrl =
                        thumbnail.dataset.imageUrl;


                    if (
                        !imageUrl
                    ) {
                        return;
                    }


                    mainImage.src =
                        imageUrl;


                    /*
                    | Remove active border
                    */

                    thumbnails.forEach(
                        item => {

                            item.classList.remove(
                                "border-indigo-600"
                            );

                            item.classList.add(
                                "border-transparent"
                            );

                        }
                    );


                    /*
                    | Add active border
                    */

                    thumbnail.classList.remove(
                        "border-transparent"
                    );

                    thumbnail.classList.add(
                        "border-indigo-600"
                    );

                }
            );

        }
    );

}

else {

    imageContainer.innerHTML = `

        <div class="property-main-image-box">

            <div class="property-main-placeholder">
                🏠
            </div>

        </div>

    `;

}


            /*
            |--------------------------------------------------------------------------
            | Contact Section
            |--------------------------------------------------------------------------
            */

            const sellerName =
                escapeHtml(
                    listing.seller_name ||
                    "Property Seller"
                );


            if (
                listing.contact_preference ===
                "show"
            ) {

                const sellerMobile =
                    listing.seller_mobile ||
                    "";


                contactSection.innerHTML = `

                    <h2 class="text-lg font-bold text-slate-900">
                        Contact
                    </h2>

                    <p class="mt-1 font-semibold text-slate-800">
                        ${sellerName}
                    </p>

                    ${
                        sellerMobile
                            ? `
                                <p class="mt-4 text-sm text-slate-500">
                                    Mobile
                                </p>

                                <a
                                    href="tel:${escapeHtml(
                                        sellerMobile
                                    )}"
                                    class="mt-1 block font-semibold text-indigo-600 hover:underline"
                                >
                                    ${escapeHtml(
                                        sellerMobile
                                    )}
                                </a>
                            `
                            : `
                                <p class="mt-4 text-sm text-slate-500">
                                    Seller contact is not available.
                                </p>
                            `
                    }

                `;

            }

            else {

                contactSection.innerHTML = `

                    <h2 class="text-lg font-bold text-slate-900">
                        Contact Seller
                    </h2>

                    <p class="mt-3 text-sm leading-6 text-slate-500">
                        The seller has chosen to share contact
                        details only after receiving a request.
                    </p>

                    <button
                        id="requestContactBtn"
                        type="button"
                        class="gradient-button mt-5"
                    >
                        Request for Contact
                    </button>

                    <div
                        id="contactRequestForm"
                        class="mt-5 hidden"
                    >

                        <input
                            id="buyerName"
                            type="text"
                            placeholder="Your Name"
                            class="mb-3 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                        >

                        <input
                            id="buyerMobile"
                            type="tel"
                            placeholder="Mobile Number"
                            class="mb-3 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                        >

                        <textarea
                            id="buyerMessage"
                            rows="4"
                            placeholder="Message (optional)"
                            class="mb-3 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                        ></textarea>

                        <button
                            id="submitContactRequest"
                            type="button"
                            class="gradient-button"
                        >
                            Send Request
                        </button>

                        <div
                            id="contactRequestResult"
                            class="mt-3 text-sm"
                        ></div>

                    </div>

                `;


                const requestButton =
                    document.getElementById(
                        "requestContactBtn"
                    );

                const requestForm =
                    document.getElementById(
                        "contactRequestForm"
                    );


                requestButton.addEventListener(
                    "click",
                    () => {

                        requestForm.classList.remove(
                            "hidden"
                        );

                        requestButton.classList.add(
                            "hidden"
                        );

                    }
                );


                const submitRequest =
                    document.getElementById(
                        "submitContactRequest"
                    );


                submitRequest.addEventListener(
                    "click",
                    async () => {

                        const buyerName =
                            document
                                .getElementById(
                                    "buyerName"
                                )
                                .value
                                .trim();


                        const buyerMobile =
                            document
                                .getElementById(
                                    "buyerMobile"
                                )
                                .value
                                .trim();


                        const buyerMessage =
                            document
                                .getElementById(
                                    "buyerMessage"
                                )
                                .value
                                .trim();


                        const result =
                            document.getElementById(
                                "contactRequestResult"
                            );


                        if (
                            !buyerName
                        ) {

                            result.textContent =
                                "Please enter your name.";

                            result.className =
                                "mt-3 text-sm text-red-600";

                            return;

                        }


                        if (
                            !buyerMobile
                        ) {

                            result.textContent =
                                "Please enter your mobile number.";

                            result.className =
                                "mt-3 text-sm text-red-600";

                            return;

                        }


                        submitRequest.disabled =
                            true;

                        submitRequest.textContent =
                            "Sending...";


                        try {

                            const response =
                                await fetch(
                                    "/api/property/contact-requests",
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json",

                                            "Accept":
                                                "application/json"
                                        },

                                        body:
                                            JSON.stringify(
                                                {
                                                    listingId:
                                                        Number(
                                                            listingId
                                                        ),

                                                    buyerName,

                                                    buyerMobile,

                                                    message:
                                                        buyerMessage
                                                }
                                            )
                                    }
                                );


                            const requestData =
                                await response.json();


                            if (
                                !response.ok ||
                                !requestData.success
                            ) {

                                throw new Error(
                                    requestData.message ||
                                    "Unable to send contact request."
                                );

                            }


                            result.textContent =
                                "Contact request sent successfully.";

                            result.className =
                                "mt-3 text-sm text-green-600";


                            submitRequest.textContent =
                                "Request Sent";

                        }

                        catch (
                            error
                        ) {

                            result.textContent =
                                error.message ||
                                "Unable to send request.";

                            result.className =
                                "mt-3 text-sm text-red-600";


                            submitRequest.disabled =
                                false;

                            submitRequest.textContent =
                                "Send Request";

                        }

                    }
                );

            }


            loading.classList.add(
                "hidden"
            );

            details.classList.remove(
                "hidden"
            );

        }

        catch (
            error
        ) {

            console.error(
                "Property details error:",
                error
            );


            loading.classList.add(
                "hidden"
            );


            errorBox.textContent =
                error.message ||
                "Unable to load property.";


            errorBox.classList.remove(
                "hidden"
            );

        }

    }
);
