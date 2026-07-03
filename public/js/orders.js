Auth.requireLogin();

async function loadOrders() {

    const from =
        document.getElementById("fromDate").value;

    const to =
        document.getElementById("toDate").value;

    let url =
        "/api/orders/history";

    if (from && to) {

        url +=
            `?from=${from}&to=${to}`;

    }

    const data =
        await API.get(url);

    if (!data.success) {

        Toast.show(
            "Unable to load orders",
            "error"
        );

        return;

    }

    const container =
        document.getElementById("ordersTable");

    container.innerHTML = "";

    if (!data.orders.length) {

        container.innerHTML = `

<div class="col-span-full rounded-xl bg-white p-10 text-center shadow">

    <h3 class="text-xl font-semibold text-slate-600">

        No Orders Found

    </h3>

</div>

`;

        return;

    }

    data.orders.forEach(order => {

        container.innerHTML += `

<div class="rounded-xl bg-white p-5 shadow transition hover:shadow-lg">

    <div class="flex items-center justify-between">

        <h2 class="text-xl font-bold">

            Order #${order.order_number}

        </h2>

        <span class="text-sm text-slate-500">

            ${new Date(order.paid_at).toLocaleString("en-IN")}

        </span>

    </div>

    <div class="mt-5 space-y-3">

        <div class="flex justify-between">

            <span class="text-slate-500">

                Table

            </span>

            <strong>

                ${order.table_name}

            </strong>

        </div>

        <div class="flex justify-between">

            <span class="text-slate-500">

                Amount

            </span>

            <strong>

                ₹${Number(order.total).toFixed(2)}

            </strong>

        </div>

    </div>

    <button
        onclick="printReceipt(${order.id})"
        class="mt-6 w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700">

        🖨 Print Receipt

    </button>

</div>

`;

    });

}

function printReceipt(orderId) {

    window.open(

        `/admin/receipt.html?orderId=${orderId}`,

        "_blank"

    );

}

document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        loadOrders
    );

loadOrders();