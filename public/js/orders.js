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

        return;

    }

    const tbody =
        document.getElementById("ordersTable");

    tbody.innerHTML = "";

    data.orders.forEach(order => {

        tbody.innerHTML += `

<tr class="border-b hover:bg-slate-50">

<td class="p-3">

${order.order_number}

</td>

<td class="p-3">

${order.table_name}

</td>

<td class="p-3">

₹${order.total.toFixed(2)}

</td>

<td class="p-3">

${order.payment_method.toUpperCase()}

</td>

<td class="p-3">

${new Date(order.paid_at).toLocaleString("en-IN")}

</td>

<td class="p-3 text-center">

<button
    onclick="printReceipt(${order.id})"
    class="rounded bg-green-600 px-3 py-1 text-white">

    Print

</button>

</td>

</tr>

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