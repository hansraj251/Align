if (!API.getToken()) {
    window.location.href = "/login.html";
}

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

    const data = await API.get("/api/billing");

    const container =
        document.getElementById("billingOrders");
        

    container.innerHTML = "";
window.billingOrders =
    data.orders;
    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    if (data.orders.length === 0) {

        container.innerHTML = `
            <div class="col-span-1 rounded-xl bg-white p-8 text-center shadow">

                No Pending Order

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

initializeBillingPage();

loadBillingOrders();

setInterval(
    loadBillingOrders,
    5000
);