if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}

async function loadBillingOrders() {

    const data = await API.get("/api/billing");

    const container =
        document.getElementById("billingOrders");

    container.innerHTML = "";

    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    if (data.orders.length === 0) {

        container.innerHTML = `
            <div class="col-span-3 rounded-xl bg-white p-8 text-center shadow">

                No Ready Orders

            </div>
        `;

        return;

    }

    data.orders.forEach(order => {

        container.innerHTML += `
            <div class="rounded-xl bg-white p-6 shadow">

                <h2 class="text-xl font-bold">

                    ${
                        order.order_number ||
                        ("Order #" + order.id)
                    }

                </h2>

                <p class="mt-2 text-slate-500">

                     ${order.table_name}

                </p>

                <p class="mt-4 text-2xl font-bold">

    ${Align.formatCurrency(order.total)}

</p>

                <button
                    onclick="payOrder(${order.id})"
                    class="mt-6 w-full rounded-lg bg-green-600 py-3 text-white">

                    Receive Payment

                </button>

            </div>
        `;

    });

}

loadBillingOrders();

setInterval(
    loadBillingOrders,
    5000
);
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