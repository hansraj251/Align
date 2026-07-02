const params =
    new URLSearchParams(window.location.search);

const orderId =
    params.get("orderId");

async function loadReceipt() {

    const data =
        await API.get(`/api/receipt/${orderId}`);

    if (!data.success) {

        document.body.innerHTML =
            data.message;

        return;

    }
const o = data.order;
    const paidDate = new Date(o.paid_at);

const paidAt = paidDate.toLocaleString(
    "en-IN",
    {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }
);

    const items = data.items
        .map(item => `

        <div class="row">

            <span>

                ${item.item_name}
${item.variant_name ? ` (${item.variant_name})` : ""}
                <br>

                ${item.quantity} × ₹${item.unit_price}

            </span>

            <strong>

                ₹${item.total_price}

            </strong>

        </div>

    `)
        .join("");

    document.getElementById("receipt")
        .innerHTML = `

<div class="center">

    ${
        o.restaurant_logo
            ? `
            <img
                src="${o.restaurant_logo}"
                alt="Restaurant Logo"
                style="
                    width:70px;
                    height:70px;
                    object-fit:contain;
                    display:block;
                    margin:0 auto 10px;
                ">
            `
            : ""
    }

    <h2>

        ${o.restaurant_name}

    </h2>

    <div>

        ${o.restaurant_address}

    </div>

    <div>

        Phone : ${o.restaurant_phone}

    </div>

    <div>

        GSTIN : ${o.restaurant_gst}

    </div>

</div>

Order :
${o.order_number}

</div>

<div>

Table :
${o.table_name}

</div>

<div>

Date :
${paidAt}

</div>

<div class="line"></div>

${items}

<div class="line"></div>

<div class="row">

<span>

Subtotal

</span>

<strong>

₹${o.subtotal.toFixed(2)}

</strong>

</div>

<div class="row">

<span>

GST

</span>

<strong>

₹${o.tax.toFixed(2)}

</strong>

</div>

<div class="row">

<span>

Discount

</span>

<strong>

₹${o.discount.toFixed(2)}

</strong>

</div>

<div class="line"></div>

<div class="row">

<strong>

TOTAL

</strong>

<strong>

₹${o.total.toFixed(2)}

</strong>

</div>

<div class="line"></div>

<div>

Payment :
${{
    cash: "Cash",
    card: "Card",
    upi: "UPI"
}[o.payment_method] || o.payment_method}

</div>

<div class="center">

    <br>

    ${o.receipt_footer}

</div>

`;

}

window.onload = async () => {

    await loadReceipt();

    setTimeout(() => {

        window.print();

    }, 300);

};
window.onafterprint = () => {

    window.close();

};