Auth.requireLogin();
const today =
    new Date()
        .toISOString()
        .split("T")[0];

document.getElementById("fromDate").value =
    today;

document.getElementById("toDate").value =
    today;

let currentReport =
    "sales";

loadReport(
    currentReport
);
  
async function loadReport(type) {

    const from =
        document.getElementById("fromDate").value;

    const to =
        document.getElementById("toDate").value;

    const data =
        await API.get(
            `/api/reports?type=${type}&from=${from}&to=${to}`
        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

const result =
    document.getElementById(
        "reportResult"
    );

if (type === "sales") {

    result.innerHTML = `

<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

<div class="rounded-xl bg-white p-5 shadow">
<div class="text-sm text-slate-500">
Orders
</div>
<div class="mt-2 text-3xl font-bold">
${data.report.total_orders}
</div>
</div>

<div class="rounded-xl bg-white p-5 shadow">
<div class="text-sm text-slate-500">
Gross Sales
</div>
<div class="mt-2 text-2xl font-bold text-blue-600">
${Align.formatCurrency(data.report.gross_sales)}
</div>
</div>

<div class="rounded-xl bg-white p-5 shadow">
<div class="text-sm text-slate-500">
Discount
</div>
<div class="mt-2 text-2xl font-bold text-red-600">
${Align.formatCurrency(data.report.total_discount)}
</div>
</div>

<div class="rounded-xl bg-white p-5 shadow">
<div class="text-sm text-slate-500">
Tax
</div>
<div class="mt-2 text-2xl font-bold text-amber-600">
${Align.formatCurrency(data.report.total_tax)}
</div>
</div>

<div class="rounded-xl bg-white p-5 shadow">
<div class="text-sm text-slate-500">
Net Sales
</div>
<div class="mt-2 text-2xl font-bold text-green-600">
${Align.formatCurrency(data.report.net_sales)}
</div>
</div>

<div class="rounded-xl bg-white p-5 shadow">
<div class="text-sm text-slate-500">
Average Bill
</div>
<div class="mt-2 text-2xl font-bold">
${Align.formatCurrency(data.report.average_bill)}
</div>
</div>

</div>

`;

}
else if (type === "orders") {

    const rows = data.report;

    if (!rows.length) {

        result.innerHTML = `

<div class="rounded-xl bg-white p-10 text-center shadow">

    No Orders Found

</div>

`;

        return;

    }

    result.innerHTML = rows.map(order => `

<div class="mb-4 rounded-xl bg-white p-5 shadow">

<div class="flex justify-between">

<div>

<h3 class="text-lg font-bold">

${order.order_number}

</h3>

<p class="text-sm text-slate-500">

${order.table_name}

</p>

</div>

<div class="text-right">

<p class="font-bold text-green-600">

${Align.formatCurrency(order.total)}

</p>

<p class="text-sm text-slate-500">

${new Date(order.paid_at).toLocaleString("en-IN")}

</p>

</div>

</div>

<div class="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3">

<div>

<span class="text-slate-500 text-sm">

Subtotal

</span>

<div>

${Align.formatCurrency(order.subtotal)}

</div>

</div>

<div>

<span class="text-slate-500 text-sm">

Discount

</span>

<div>

${Align.formatCurrency(order.discount)}

</div>

</div>

<div>

<span class="text-slate-500 text-sm">

Tax

</span>

<div>

${Align.formatCurrency(order.tax)}

</div>

</div>

<div>

<span class="text-slate-500 text-sm">

Payment

</span>

<div>

${order.payment_method || "-"}

</div>

</div>

<div>

<span class="text-slate-500 text-sm">

Status

</span>

<div>

${order.status}

</div>

</div>

</div>

</div>

`).join("");

}
else if (type === "items") {

    const items = data.report;

    if (!items.length) {

        result.innerHTML = `

<div class="rounded-xl bg-white p-10 text-center shadow">

    No Item Sales Found

</div>

`;

        return;

    }

    result.innerHTML = `

<div class="overflow-x-auto rounded-xl bg-white shadow">

<table class="min-w-full">

<thead class="bg-slate-100">

<tr>

<th class="px-4 py-3 text-left">

Item

</th>

<th class="px-4 py-3 text-right">

Qty Sold

</th>

<th class="px-4 py-3 text-right">

Sales

</th>

</tr>

</thead>

<tbody>

${items.map(item => `

<tr class="border-t">

<td class="px-4 py-3">

${item.item_name}

</td>

<td class="px-4 py-3 text-right">

${item.quantity}

</td>

<td class="px-4 py-3 text-right font-semibold text-green-600">

${Align.formatCurrency(item.sales)}

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`;

}
else if (type === "payments") {

    const payments = data.report;

    if (!payments.length) {

        result.innerHTML = `

<div class="rounded-xl bg-white p-10 text-center shadow">

    No Payment Data Found

</div>

`;

        return;

    }

    result.innerHTML = `

<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

${payments.map(payment => `

<div class="rounded-xl bg-white p-6 shadow">

<div class="text-slate-500">

${formatPaymentMethod(
    payment.payment_method
)}

</div>

<div class="mt-3 text-3xl font-bold text-blue-600">

${Align.formatCurrency(payment.amount)}

</div>

<div class="mt-2 text-sm text-slate-500">

${payment.total_orders} Orders

</div>

</div>

`).join("")}

</div>

`;

}
else if (type === "audit") {

    result.innerHTML = `

<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

<div class="rounded-xl bg-white p-5 shadow">

<div class="text-sm text-slate-500">
Total Orders
</div>

<div class="mt-2 text-3xl font-bold">

${data.report.total_orders || 0}

</div>

</div>

<div class="rounded-xl bg-white p-5 shadow">

<div class="text-sm text-slate-500">
Paid
</div>

<div class="mt-2 text-3xl font-bold text-green-600">

${data.report.paid_orders || 0}

</div>

</div>

<div class="rounded-xl bg-white p-5 shadow">

<div class="text-sm text-slate-500">
Cancelled
</div>

<div class="mt-2 text-3xl font-bold text-red-600">

${data.report.cancelled_orders || 0}

</div>

</div>

<div class="rounded-xl bg-white p-5 shadow">

<div class="text-sm text-slate-500">
Kitchen Pending
</div>

<div class="mt-2 text-3xl font-bold text-orange-600">

${data.report.kitchen_pending || 0}

</div>

</div>

<div class="rounded-xl bg-white p-5 shadow">

<div class="text-sm text-slate-500">
Billing Pending
</div>

<div class="mt-2 text-3xl font-bold text-blue-600">

${data.report.billing_pending || 0}

</div>

</div>

<div class="rounded-xl bg-white p-5 shadow">

<div class="text-sm text-slate-500">
Open Orders
</div>

<div class="mt-2 text-3xl font-bold">

${data.report.open_orders || 0}

</div>

</div>

</div>

`;

}

}

// 👇 Ye event listeners yahin neeche lagao

document
    .getElementById("salesReportBtn")
    .onclick = () => {

        currentReport =
            "sales";

        loadReport(
            currentReport
        );

    };

document
    .getElementById("ordersReportBtn")
    .onclick = () => {

        currentReport =
            "orders";

        loadReport(
            currentReport
        );

    };

document
    .getElementById("itemsReportBtn")
    .onclick = () => {

        currentReport =
            "items";

        loadReport(
            currentReport
        );

    };

document
    .getElementById("paymentsReportBtn")
    .onclick = () => {

        currentReport =
            "payments";

        loadReport(
            currentReport
        );

    };

document
    .getElementById("auditReportBtn")
    .onclick = () => {

        currentReport =
            "audit";

        loadReport(
            currentReport
        );

    };

document
    .getElementById("downloadExcelBtn")
    .onclick = async () => {

        const from =
            document.getElementById("fromDate").value;

        const to =
            document.getElementById("toDate").value;

        const response =
            await fetch(
                `/api/reports/excel?from=${from}&to=${to}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${API.getToken()}`
                    }
                }
            );

        if (!response.ok) {

            Toast.show(
                "Unable to download report",
                "error"
            );

            return;

        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download =
            `Restaurant_Report_${from}_to_${to}.xlsx`;

        a.click();

        window.URL.revokeObjectURL(url);

    };    

document
    .getElementById("downloadPdfBtn")
    .onclick = async () => {

        const from =
            document.getElementById("fromDate").value;

        const to =
            document.getElementById("toDate").value;

        const response =
            await fetch(
                `/api/reports/pdf?from=${from}&to=${to}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${API.getToken()}`
                    }
                }
            );

        if (!response.ok) {

            Toast.show(
                "Unable to download report",
                "error"
            );

            return;

        }

        const blob =
            await response.blob();

        const url =
            window.URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download =
            `Restaurant_Report_${from}_to_${to}.pdf`;

        a.click();

        window.URL.revokeObjectURL(url);

    };    
function formatPaymentMethod(
    method
) {

    if (!method) {

        return "Unknown";

    }

    switch (method.toLowerCase()) {

        case "upi":
            return "UPI";

        case "cash":
            return "Cash";

        case "card":
            return "Card";

        case "bank_transfer":
            return "Bank Transfer";

        default:
            return method
                .split("_")
                .map(
                    word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                )
                .join(" ");

    }

}    

document
    .getElementById("fromDate")
    .addEventListener(
        "change",
        e => {

            e.preventDefault();

            loadReport(currentReport);

        }
    );

document
    .getElementById("toDate")
    .addEventListener(
        "change",
        e => {

            e.preventDefault();

            loadReport(currentReport);

        }
    );