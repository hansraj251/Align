if (!API.getToken()) {
    window.location.href = "/login.html";
}
let diningAreas = [];

const AREA_FILTER_STORAGE_KEY =
    "billingAreaFilter";

let billingAreaFilter = {};
function initializeBillingPage() {

    const staff =
        StaffAuth.staff();

    if (

        !staff ||
        staff.role !== "cashier"

    ) {

        return;

    }

    document
    .querySelectorAll(".billing-nav")
    .forEach(element => {

        element.remove();

    });
    document
    .getElementById(
        "billingAreaFilter"
    )
    ?.classList.remove(
        "hidden"
    );

document
    .getElementById(
        "billingAreaFilterMobile"
    )
    ?.classList.remove(
        "hidden"
    );

    document
        .getElementById(
            "billingLogoutBtn"
        )
        ?.classList.remove("hidden");

    document
        .getElementById(
            "billingLogoutBtnMobile"
        )
        ?.classList.remove("hidden");

    document
        .getElementById(
            "billingLogoutBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                StaffAuth.logout();

            }
        );

    document
        .getElementById(
            "billingLogoutBtnMobile"
        )
        ?.addEventListener(
            "click",
            () => {

                StaffAuth.logout();

            }
        );

}
async function loadBillingOrders() {

    const data =
    await API.get("/api/billing");

const container =
    document.getElementById(
        "billingOrders"
    );

container.innerHTML = "";

if (!data.success) {

    Toast.show(
        data.message,
        "error"
    );

    return;

}

const visibleOrders =
    data.orders.filter(
        isAreaVisible
    );

window.billingOrders =
    visibleOrders;

    if (data.orders.length === 0) {

        container.innerHTML = `
            <div class="col-span-1 rounded-xl bg-white p-8 text-center shadow">

                No Pending Order

            </div>
        `;

        return;

    }
    if (
    visibleOrders.length === 0
) {

    container.innerHTML = `
        <div class="col-span-1 rounded-xl bg-white p-8 text-center shadow">

            No Pending Order

        </div>
    `;

    return;

}

    visibleOrders.forEach(order => {

        container.innerHTML += `
            <div class="rounded-xl bg-white p-6 shadow">

                <h2 class="text-xl font-bold">

                    ${
                        order.order_number ||
                        ("Order #" + order.id)
                    }

                </h2>

                <p class="mt-2 text-slate-500">

    ${order.area_name}

    <br>

    Table :
    ${order.table_name}

</p>

                <div class="mt-4 space-y-2">

    <div class="flex justify-between text-sm">

        <span>Subtotal</span>

        <strong>

            ${Align.formatCurrency(order.subtotal)}

        </strong>

    </div>

    <div class="flex justify-between text-sm">

        <span>GST</span>

        <strong>

            ${Align.formatCurrency(order.tax)}

        </strong>

    </div>

    <div class="flex justify-between text-lg font-bold">

        <span>Total</span>

        <span>

            ${Align.formatCurrency(order.total)}

        </span>

    </div>

</div>

                <button
    onclick="openBillingPayment(${order.id})"
    class="mt-6 w-full rounded-lg bg-green-600 py-3 text-white">

    Pay

</button>

            </div>
        `;

    });
    

}


function openBillingPayment(
    orderId
)
{
   

    const order =
        window.billingOrders.find(
            o => o.id === orderId
        );

    if (!order)
    {
        Toast.show(
            "Order not found",
            "error"
        );

        return;
    }

    openPaymentModal(order);
}
async function payOrder(
    orderId,
    paymentMethod = "cash"
) {

    const data = await API.patch(
        `/api/payment/${orderId}`,
        {
            payment_method: paymentMethod
        }
    );

    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    Toast.show("Payment received");
    window.open(
    `/admin/receipt.html?orderId=${orderId}`,
    "_blank"
);

    loadBillingOrders();

}

(async () => {

    initializeBillingPage();

    loadAreaFilter();

    await loadDiningAreas();

    setupAreaFilter();

    await loadBillingOrders();

})();

function loadAreaFilter() {

    try {

        billingAreaFilter =
            JSON.parse(
                localStorage.getItem(
                    AREA_FILTER_STORAGE_KEY
                ) || "{}"
            );

    } catch {

        billingAreaFilter = {};

    }

}

function saveAreaFilter() {

    localStorage.setItem(
        AREA_FILTER_STORAGE_KEY,
        JSON.stringify(
            billingAreaFilter
        )
    );

}

function isAreaVisible(order) {

    if (!order.area_name) {

        return true;

    }

    if (

        billingAreaFilter[
            order.area_name
        ] === undefined

    ) {

        billingAreaFilter[
            order.area_name
        ] = true;

        saveAreaFilter();

    }

    return billingAreaFilter[
        order.area_name
    ];

}

async function loadDiningAreas() {

    const data =
        await API.get(
            "/api/dining-areas"
        );

    if (!data.success) {

        return;

    }

    diningAreas =
        data.areas;

    let changed =
        false;

    diningAreas.forEach(area => {

        if (
            billingAreaFilter[
                area.name
            ] === undefined
        ) {

            billingAreaFilter[
                area.name
            ] = true;

            changed = true;

        }

    });
    

    if (changed) {

        saveAreaFilter();

    }
    renderAreaFilter(
    "areaFilterDropdown"
);

renderAreaFilter(
    "areaFilterDropdownMobile"
);

}function renderAreaFilter(dropdownId) {

    const dropdown =
        document.getElementById(
            dropdownId
        );

    if (!dropdown) {

        return;

    }

    dropdown.innerHTML =
        diningAreas
            .map(area => `

                <label
                    class="flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0">

                    <input
                        type="checkbox"
                        class="area-filter-checkbox"
                        data-area-name="${area.name}"
                        ${
                            billingAreaFilter[
                                area.name
                            ]
                                ? "checked"
                                : ""
                        }>

                    <span>

                        ${area.name}

                    </span>

                </label>

            `)
            .join("");

}
function setupAreaFilter() {

    [
        {
            buttonId:
                "areaFilterBtn",
            dropdownId:
                "areaFilterDropdown"
        },
        {
            buttonId:
                "areaFilterBtnMobile",
            dropdownId:
                "areaFilterDropdownMobile"
        }
    ].forEach(item => {

        const button =
            document.getElementById(
                item.buttonId
            );

        const dropdown =
            document.getElementById(
                item.dropdownId
            );

        if (
            !button ||
            !dropdown
        ) {

            return;

        }

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                dropdown.classList.toggle(
                    "hidden"
                );

            }
        );
        dropdown.addEventListener(
    "change",
    event => {

        const checkbox =
            event.target;

        if (
            !checkbox.classList.contains(
                "area-filter-checkbox"
            )
        ) {

            return;

        }

        billingAreaFilter[
    checkbox.dataset.areaName
] =
    checkbox.checked;

        saveAreaFilter();

        loadBillingOrders();

    }
);

        document.addEventListener(
            "click",
            event => {

                if (
                    !dropdown.contains(
                        event.target
                    ) &&
                    !button.contains(
                        event.target
                    )
                ) {

                    dropdown.classList.add(
                        "hidden"
                    );

                }

            }
        );

    });

}



setInterval(
    loadBillingOrders,
    5000
);