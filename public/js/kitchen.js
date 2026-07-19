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
    window.location.href = "/admin/login.html";
}
const params =
    new URLSearchParams(
        window.location.search
    );

const areaId =
    params.get("area");

const backButtons = [

    document.getElementById(
        "backBtn"
    ),

    document.getElementById(
        "backBtnMobile"
    )

].filter(Boolean);

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
toggleKitchenHeader();

setupBackButton();

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

    Mark Ready

</button>
`

: ""
}


</div>

    </div>
`;

}

async function loadKitchenOrders() {

    const data = await API.get("/api/kitchen");

    const container =
        document.getElementById("kitchenOrders");

    container.innerHTML = "";

    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    if (data.tickets.length === 0) {

        container.innerHTML = `
            <div class="col-span-4 rounded-xl bg-white p-8 text-center shadow">

                 No Pending Orders

            </div>
        `;

        return;

    }
    data.tickets.forEach(
    ticket => {

        container.innerHTML +=
            renderTicket(
                ticket
            );

    }
);

}
async function refreshTicket(
    ticketId
) {

    const data =
        await API.get(
            `/api/kitchen/${ticketId}`
        );

    if (!data.success) {

        loadKitchenOrders();

        return;

    }

    const ticket =
        data.ticket;

    const card =
        document.getElementById(
            `ticket-${ticketId}`
        );

    if (!card) {

        loadKitchenOrders();

        return;

    }

    card.outerHTML =
        renderTicket(
            ticket
        );

}

loadKitchenOrders();
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

setInterval(
    loadKitchenOrders,
    5000
);
async function updateStatus(
    ticketId,
    status
) {

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

    loadKitchenOrders();

}
async function markItemReady(ticketItemId) {

    const data = await API.patch(

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

    loadKitchenOrders();

}
[
    "kitchenLogoutBtn",
    "kitchenLogoutBtnMobile"
].forEach(id => {

    document
        .getElementById(id)
        ?.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "staff"
                );

                localStorage.removeItem(
                    "staffToken"
                );

                localStorage.removeItem(
                    "token"
                );

                window.location.href =
                    "/admin/login.html";

            }
        );

});