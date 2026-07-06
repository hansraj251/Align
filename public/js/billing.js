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

                <div class="mt-4 space-y-2">

    <div class="flex justify-between text-sm">

        <span>Subtotal</span>

        <strong>

            ${Align.formatCurrency(order.subtotal)}

        </strong>

    </div>

    <div class="flex items-center justify-between">

        <label class="text-sm">

            Discount %

        </label>

        <input

            id="discount-${order.id}"

            type="number"

            min="0"

            max="100"

            value="${order.discount}"

            class="w-20 rounded border px-2 py-1 text-right"

        >

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
                    onclick="payOrder(${order.id})"
                    class="mt-6 w-full rounded-lg bg-green-600 py-3 text-white">

                    Print Bill

                </button>

            </div>
        `;

    const input =
    document.getElementById(
        `discount-${order.id}`
    );

input.onchange = async () => {

    const discount =
        Number(input.value || 0);

    const result =
        await API.patch(
            `/api/orders/${order.id}/discount`,
            {
                discount
            }
        );

    if (!result.success) {

        Toast.show(
            result.message,
            "error"
        );

        return;

    }

    loadBillingOrders();

};    

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