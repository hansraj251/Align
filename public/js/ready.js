let currentScope =
    "my";

let readyOrders =
    [];
let refreshInterval =
    null;   
let myReadyCount =
    0;

let allReadyCount =
    0;     
document.addEventListener(
    "DOMContentLoaded",
    initialize
);
async function initialize() {

    bindEvents();

    await loadReadyItems();
    startAutoRefresh();

}
function startAutoRefresh() {

    if (refreshInterval) {

        clearInterval(
            refreshInterval
        );

    }

    refreshInterval =
        setInterval(
            async () => {

                await loadReadyItems();

            },
            5000
        );

}
function bindEvents() {

    document
        .getElementById("myReadyTab")
        .addEventListener(
            "click",
            async () => {

                currentScope = "my";

                await loadReadyItems();

            }
        );

    document
        .getElementById("allReadyTab")
        .addEventListener(
            "click",
            async () => {

                currentScope = "all";

                await loadReadyItems();

            }
        );
    document.addEventListener(
    "click",
    async (event) => {

        const serveItemButton =
            event.target.closest(
                ".serveItemBtn"
            );

        if (serveItemButton) {

            await serveItem(
                serveItemButton.dataset.itemId
            );

            return;

        }

        const serveAllButton =
            event.target.closest(
                ".serveBtn"
            );

        if (serveAllButton) {

            await serveTicket(
                serveAllButton.dataset.ticketId
            );

        }

    }
);

}
async function loadReadyItems() {

    const [
        myResponse,
        allResponse
    ] =
        await Promise.all([

            API.get(
                "/api/waiter/ready-items?scope=my"
            ),

            API.get(
                "/api/waiter/ready-items?scope=all"
            )

        ]);

    myReadyCount =
        myResponse.orders.length;

    allReadyCount =
        allResponse.orders.length;

    readyOrders =
        currentScope === "my"
            ? myResponse.orders
            : allResponse.orders;

    renderReadyItems();

}  
function updateTabs() {

    const myTab =
        document.getElementById(
            "myReadyTab"
        );

    const allTab =
        document.getElementById(
            "allReadyTab"
        );

    if (currentScope === "my") {

        myTab.className =
            "bg-emerald-600 px-4 py-3 font-semibold text-white transition";

        allTab.className =
            "bg-white px-4 py-3 font-semibold text-slate-700 transition";

    } else {

        allTab.className =
            "bg-emerald-600 px-4 py-3 font-semibold text-white transition";

        myTab.className =
            "bg-white px-4 py-3 font-semibold text-slate-700 transition";

    }

}
function renderReadyItems() {

    updateTabs();

    const container =
        document.getElementById(
            "readyItemsContainer"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );

    document
        .getElementById(
            "loadingState"
        )
        .classList.add(
            "hidden"
        );
    document
    .getElementById(
        "myReadyCount"
    )
    .textContent =
    `(${myReadyCount})`;

document
    .getElementById(
        "allReadyCount"
    )
    .textContent =
    `(${allReadyCount})`;    

    if (!readyOrders.length) {

        container.innerHTML = "";

        empty.classList.remove(
            "hidden"
        );

        return;

    }

    empty.classList.add(
        "hidden"
    );

    container.innerHTML =
        readyOrders
            .map(
                renderCard
            )
            .join("");

}
function renderCard(
    order
) {
     const readyItems =
        order.items.filter(
            item => item.status === "ready"
        );

    return `

<div
class="rounded-xl bg-white shadow">

    <div
    class="border-b p-4">

        <div
        class="flex items-center justify-between">

            <div>

                <h2
                class="text-lg font-bold">

                    ${order.table_name}

                </h2>

                <p
                class="text-sm text-slate-500">

                    ${order.area_name}

                </p>

            </div>

        </div>

        <div
        class="mt-3 flex flex-wrap gap-2 text-sm">

            <span
            class="rounded bg-slate-100 px-2 py-1">

                ${order.order_number}

            </span>

        </div>

    </div>

    <div
    class="space-y-2 p-4">

        ${order.items
            .map(
                item => `
<div
class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">

    <div>

        <div
        class="font-medium">

            ${item.item_name}

        </div>

        ${
            item.variant_name
                ? `
<div
class="text-xs text-slate-500">

${item.variant_name}

</div>
`
                : ""
        }

    </div>

    <div
class="flex items-center gap-2">

    <div
    class="font-bold">

        × ${item.quantity}

    </div>

    ${
        item.status === "ready"
            ? `
<button
class="serveItemBtn rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
data-item-id="${item.id}">

    Serve

</button>
`
            : ""
    }

</div>

</div>
`
            )
            .join("")}

    </div>

    <div
    class="border-t p-4">

       ${
    readyItems.length > 1
        ? `
<button

class="serveBtn w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"

data-ticket-id="${order.ticket_id}">

    Serve All

</button>
`
        : ""
}

    </div>

</div>

`;

}
async function serveTicket(
    ticketId
) {

    Modal.confirm(

        "Serve All",

        "Mark all ready items as served?",

        async () => {

            try {

                const response =
                    await API.patch(
                        "/api/waiter/serve/" +
                        ticketId
                    );

                if (!response.success) {

                    Toast.show(
                        response.message,
                        "error"
                    );

                    return;

                }

                Toast.show(
                    response.message,
                    "success"
                );

                Modal.close();

                await loadReadyItems();

            } catch (error) {

                console.error(
                    error
                );

                Toast.show(
                    "Failed to serve items.",
                    "error"
                );

            }

        },

        {

            buttonText: "Serve All",

            buttonClass: "bg-emerald-600 hover:bg-emerald-700",

            loadingText: "Serving..."

        }

    );

}
async function serveItem(
    itemId
) {

    Modal.confirm(

        "Serve Item",

        "Mark this item as served?",

        async () => {

            try {

                const response =
                    await API.patch(
                        "/api/waiter/serve/item/" +
                        itemId
                    );

                if (!response.success) {

                    Toast.show(
                        response.message,
                        "error"
                    );

                    return;

                }

                Toast.show(
                    response.message,
                    "success"
                );

                Modal.close();

                await loadReadyItems();

            } catch (error) {

                console.error(
                    error
                );

                Toast.show(
                    "Failed to serve item.",
                    "error"
                );

            }

        },

        {

            buttonText: "Serve",

            buttonClass: "bg-emerald-600 hover:bg-emerald-700",

            loadingText: "Serving..."

        }

    );

}