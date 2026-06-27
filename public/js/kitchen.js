if (!API.getToken()) {
    window.location.href = "/admin/login.html";
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

    if (data.orders.length === 0) {

        container.innerHTML = `
            <div class="col-span-3 rounded-xl bg-white p-8 text-center shadow">

                🎉 No Pending Orders

            </div>
        `;

        return;

    }

    data.orders.forEach(order => {
        const itemsHtml = (order.items || [])
    .map(item => `
        <div class="flex justify-between text-sm py-1">

            <span>
                ${item.name}
            </span>

            <strong>
                ×${item.quantity}
            </strong>

        </div>
    `)
    .join("");

    const borderClass =
    order.status === "sent_to_kitchen"
        ? "border-l-4 border-orange-500"
        : "border-l-4 border-green-500";
        container.innerHTML += `
    <div class="${borderClass} rounded-xl bg-white p-6 shadow">

        <h2 class="text-xl font-bold">
            ${
                order.order_number ||
                ("Order #" + order.id)
            }
        </h2>

        <p class="mt-2 text-slate-500">
            🪑 ${order.table_name}
        </p>

        <div class="mt-4 border-t border-b py-3">

            ${itemsHtml}

        </div>

        <p class="mt-4 text-lg font-semibold">
            ₹${order.total}
        </p>

        ${
    order.status === "sent_to_kitchen"
    ? `
        <button
            onclick="updateStatus(${order.id}, 'preparing')"
            class="mt-5 w-full rounded-lg bg-orange-500 py-3 text-white">

            Start Preparing

        </button>
    `
    : `
        <button
            onclick="updateStatus(${order.id}, 'ready')"
            class="mt-5 w-full rounded-lg bg-green-600 py-3 text-white">

            Mark Ready

        </button>
    `
}

    </div>
`;

    });

}

loadKitchenOrders();

setInterval(
    loadKitchenOrders,
    5000
);
async function updateStatus(orderId, status) {

    const data = await API.patch(
        `/api/orders/${orderId}/status`,
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