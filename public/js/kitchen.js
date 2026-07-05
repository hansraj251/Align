if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}
const params =
    new URLSearchParams(
        window.location.search
    );

const areaId =
    params.get("area");

const backBtn =
    document.getElementById("backBtn");

async function setupBackButton() {

    if (!areaId) {
        return;
    }

    backBtn.classList.remove("hidden");

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

            backBtn.textContent =
                `← ${area.name}`;

        }

    }

    backBtn.onclick = () => {

        window.location.href =
            `/admin/area.html?id=${areaId}`;

    };

}

setupBackButton();
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

    data.tickets.forEach(ticket => {
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

    const borderClass =
    ticket.status === "sent_to_kitchen"
        ? "border-l-4 border-orange-500"
        : "border-l-4 border-green-500";
        container.innerHTML += `
    <div class="${borderClass} flex h-full flex-col rounded-xl bg-white p-6 shadow">

        <h2 class="text-xl font-bold">
            ${
                ticket.ticket_number ||
                ("Order #" + ticket.id)
            }
        </h2>

        <p class="mt-2 text-slate-500">
             ${ticket.table_name}
        </p>

        <div class="mt-4 border-t border-b py-3">

            ${itemsHtml}

        </div>

        <div class="mt-auto pt-5">

${
ticket.status === "new"
? `
<button
    onclick="updateStatus(${ticket.id}, 'preparing')"
    class="w-full rounded-lg bg-orange-500 py-3 text-white">

    Start Preparing

</button>
`
: ticket.status === "preparing"
? `
<button
    onclick="updateStatus(${ticket.id}, 'ready')"
    class="w-full rounded-lg bg-green-600 py-3 text-white">

    Mark Ready

</button>
`
: ticket.status === "ready"
? `
<button
    onclick="updateStatus(${ticket.id}, 'served')"
    class="w-full rounded-lg bg-blue-600 py-3 text-white">

    Served

</button>
`
: ""
}

</div>

    </div>
`;

    });

}

loadKitchenOrders();

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

    Toast.show(
    status === "preparing"
        ? "Cooking started"
        : "Order is ready"
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