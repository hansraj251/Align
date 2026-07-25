let diningAreas = [];
function toggleKitchenHeader() {

    const staff = JSON.parse(
        localStorage.getItem("staff") || "{}"
    );

    if (
        staff.role !== "kitchen"
    ) {

        return;

    }
    [
    "kitchenHeaderButtons",
    "kitchenHeaderButtonsMobile"
].forEach(id => {

    document
        .getElementById(id)
        ?.classList.add(
            "hidden"
        );

});
    [
    "kitchenActions",
    "kitchenActionsMobile"
].forEach(id => {

    document
        .getElementById(id)
        ?.classList.remove(
            "hidden"
        );

});
    

[
    "kitchenLogoutBtn",
    "kitchenLogoutBtnMobile"
].forEach(id => {

    document
        .getElementById(id)
        ?.classList.remove(
            "hidden"
        );

});

}

if (!API.getToken()) {
    window.location.href = "/login.html";
}
const params =
    new URLSearchParams(
        window.location.search
    );

const areaId =
    params.get("area");

const AREA_FILTER_STORAGE_KEY =
    "kitchenAreaFilter";

let kitchenAreaFilter = {};    

const backButtons = [

    document.getElementById(
        "backBtn"
    ),

    document.getElementById(
        "backBtnMobile"
    )

].filter(Boolean);
const processingTickets =
    new Set();

const processingItems =
    new Set();

async function setupBackButton() {

    if (!areaId) {
        return;
    }

    backButtons.forEach(button => {

    button.classList.remove(
        "hidden"
    );

});

const data =
    await API.get(
        "/api/dining-areas"
    );

if (data.success) {

    const area =
        data.areas.find(
            a => a.id == areaId
        );

    if (area) {

        backButtons.forEach(button => {

            button.textContent =
                area.name;

        });

    }

}

backButtons.forEach(button => {

    button.onclick = () => {

        window.location.href =
            `/admin/area.html?id=${areaId}`;

    };

});

}
(async () => {

    toggleKitchenHeader();

    await setupBackButton();

    loadAreaFilter();

    await loadDiningAreas();

    setupAreaFilter();

    await loadKitchenOrders();

})();

function renderTicket(
    ticket
) {

        const pendingItems =
    (ticket.items || []).filter(
        item => item.status === "pending"
    ).length;

const cancelledItems =
    (ticket.items || []).filter(
        item => item.status === "cancelled"
    ).length;

const totalItems =
    (ticket.items || []).length;

const allCancelled =
    totalItems > 0 &&
    cancelledItems === totalItems;

        const itemsHtml = (ticket.items || [])
.map(item => `
<div class="border-b py-3 last:border-b-0">

    <div class="flex justify-between">

        <div>

            <div class="font-medium">

                ${item.item_name}

            </div>

            ${
                item.variant_name
                ? `
                <div class="text-xs text-slate-500">

                    ${item.variant_name}

                </div>
                `
                : ""
            }
            ${
    item.note
    ? `
    <div class="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">

        <strong>Note:</strong> ${item.note}

    </div>
    `
    : ""
}
            

            <div class="mt-1 text-xs">

                ${
                    item.status === "pending"
                    ? `<span class="text-orange-600">Pending</span>`
                    : item.status === "preparing"
                    ? `<span class="text-yellow-600">Preparing</span>`
                    : item.status === "ready"
                    ? `<span class="text-green-600">Ready</span>`
                    : `<span class="text-slate-500">${item.status}</span>`
                }

            </div>

        </div>

        <div class="text-right">

            <div class="font-semibold">

                ×${item.quantity}

            </div>
            

            ${

item.status === "preparing"

? `

<button

    onclick="markItemReady(${item.id})"

    class="mt-2 rounded bg-green-600 px-3 py-1 text-xs text-white">

    Ready

</button>

`

: ""

}

        </div>

    </div>

</div>
`)
.join("");

const preparingItems =
(ticket.items || []).filter(
    item => item.status === "preparing"
).length;

const readyItems =
(ticket.items || []).filter(
    i => i.status === "ready"
).length;
    const borderClass =
    ticket.status === "sent_to_kitchen"
        ? "border-l-4 border-orange-500"
        : "border-l-4 border-green-500";

        return `
    <div id="ticket-${ticket.id}"

    class="${borderClass} flex flex-col rounded-xl bg-white p-4 lg:p-5 shadow max-h-[520px]">

        <h2 class="text-lg sm:text-lg lg:text-xl xl:text-2xl font-bold">
            ${
                ticket.ticket_number ||
                ("Order #" + ticket.id)
            }
        </h2>

        <p class="mt-2 text-sm lg:text-base text-slate-500">

${ticket.area_name}

${
    ticket.area_name?.toLowerCase() !== "take away"
        ? `<br>${ticket.table_name}`
        : ""
}

</p>

        <div class="mt-4 flex-1 overflow-y-auto border-t border-b py-3">

    ${itemsHtml}

</div>

        <div class="mt-1 text-sm lg:text-base">
        

${
pendingItems > 0
? `
<button
    onclick="updateStatus(${ticket.id}, 'preparing')"
    class="w-full rounded-lg bg-orange-500 py-3 text-white">

    Start Preparing

</button>
`

: preparingItems > 0

? `
<button
    onclick="updateStatus(${ticket.id}, 'ready')"
    class="w-full rounded-lg bg-green-600 py-3 text-white">

    Ready All

</button>
`

: ""
}


</div>

    </div>
`;

}

async function loadKitchenOrders() {

    const data =
        await API.get(
            "/api/kitchen"
        );
    console.log(data.tickets[0]);

    const container =
        document.getElementById(
            "kitchenOrders"
        );

    if (!data.success) {

        container.innerHTML = "";

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    if (data.tickets.length === 0) {

        container.innerHTML = `
            <div class="col-span-1 rounded-xl bg-white p-8 text-center shadow">

                No Pending Orders

            </div>
        `;

        return;

    }

    const visibleTickets =
    data.tickets.filter(
        isAreaVisible
    );

if (visibleTickets.length === 0) {

    container.innerHTML = `
        <div class="col-span-1 rounded-xl bg-white p-8 text-center shadow">

            No Pending Orders

        </div>
    `;

    return;

}

container.innerHTML =
    visibleTickets
        .map(renderTicket)
        .join("");

}
async function refreshTicket(
    ticketId
) {

    const data =
        await API.get(
            `/api/kitchen/${ticketId}`
        );

   if (!data.success) {

    const card =
        document.getElementById(
            `ticket-${ticketId}`
        );

    if (card) {

        card.remove();

    }

    const container =
        document.getElementById(
            "kitchenOrders"
        );

    if (
        container &&
        container.children.length === 0
    ) {

        container.innerHTML = `
            <div class="col-span-1 rounded-xl bg-white p-8 text-center shadow">

                No Pending Orders

            </div>
        `;

    }

    return;

}

    const ticket =
        data.ticket;

    const card =
        document.getElementById(
            `ticket-${ticketId}`
        );

    if (!card) {

    return;

}
    if (
    !isAreaVisible(ticket)
) {

    card.remove();

    return;

}

card.outerHTML =
    renderTicket(
        ticket
    );

}

async function closeCancelledTicket(
    ticketId
) {

    const data =
        await API.patch(
            `/api/kitchen/${ticketId}/close-cancelled`
        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    Toast.show(
        "Cancelled KOT closed",
        "success"
    );

    loadKitchenOrders();

}

async function updateStatus(
    ticketId,
    status
) {
    if (
    processingTickets.has(
        ticketId
    )
) {

    return;

}

processingTickets.add(
    ticketId
);
 try {

    const data = await API.patch(
    `/api/kitchen/${ticketId}/status`,
        {
            status
        }
    );

    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    let message = "";

if (status === "preparing") {

    message = "Cooking started";

}
else if (status === "ready") {

    message = "Order is ready";

}
else if (status === "served") {

    message = "Sent to Billing";

}

Toast.show(
    message,
    "success"
);

    await refreshTicket(
    ticketId
);
    } finally {

        processingTickets.delete(
            ticketId
        );}

}
async function markItemReady(
    ticketItemId
) {

    if (
        processingItems.has(
            ticketItemId
        )
    ) {

        return;

    }

    processingItems.add(
        ticketItemId
    );

    try {

        const data =
            await API.patch(

                `/api/kitchen/items/${ticketItemId}/status`,

                {
                    status: "ready"
                }

            );

        if (!data.success) {

            Toast.show(
                data.message,
                "error"
            );

            return;

        }

       Toast.show(
    "Item Ready",
    "success"
);

await refreshTicket(
    data.ticketId
);

    } finally {

        processingItems.delete(
            ticketItemId
        );

    }

}
[
    "kitchenLogoutBtn",
    "kitchenLogoutBtnMobile"
].forEach(id => {

    document
    .getElementById(id)
    ?.addEventListener(
        "click",
        async () => {

            await Auth.logout();

        }
    );
        

});
function loadAreaFilter() {

    try {

        kitchenAreaFilter =
            JSON.parse(
                localStorage.getItem(
                    AREA_FILTER_STORAGE_KEY
                ) || "{}"
            );

    } catch {

        kitchenAreaFilter = {};

    }

}

function saveAreaFilter() {

    localStorage.setItem(
        AREA_FILTER_STORAGE_KEY,
        JSON.stringify(
            kitchenAreaFilter
        )
    );

}

function isAreaVisible(
    ticket
) {

    if (
        ticket.area_id == null
    ) {

        return true;

    }

    if (
        kitchenAreaFilter[
            ticket.area_id
        ] === undefined
    ) {

        kitchenAreaFilter[
            ticket.area_id
        ] = true;

        saveAreaFilter();

    }

    return kitchenAreaFilter[
        ticket.area_id
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
            kitchenAreaFilter[
                area.id
            ] === undefined
        ) {

            kitchenAreaFilter[
                area.id
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
                        data-area-id="${area.id}"
                        ${
                            kitchenAreaFilter[
                                area.id
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

        kitchenAreaFilter[
            Number(
                checkbox.dataset.areaId
            )
        ] =
            checkbox.checked;

        saveAreaFilter();

        loadKitchenOrders();

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
    loadKitchenOrders,
    5000
);