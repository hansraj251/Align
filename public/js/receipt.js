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

const paidAt =
    Align.formatDateTime(
        o.paid_at
    );

    const items = data.items
        .map(item => `

        <div class="row">

            <span>

                ${item.item_name}
${item.variant_name ? ` (${item.variant_name})` : ""}
                <br>

                ${item.quantity} ×${Align.formatCurrency(item.unit_price)}

            </span>

            <strong>

               ${Align.formatCurrency(item.total_price)}

            </strong>

        </div>

    `)
        .join("");
    const paymentHtml =
    data.paymentSplits &&
    data.paymentSplits.length > 0
        ? `
<div class="line"></div>

<div class="center">
    <strong>
        Payment Details
    </strong>
</div>

${data.paymentSplits
    .map(payment => `
<div class="row">

    <span>

        ${
            {
                cash: "Cash",
                upi: "UPI",
                card: "Card",
                wallet: "Wallet",
                bank: "Bank Transfer",
                other: "Other"
            }[
                payment.payment_method
            ] || payment.payment_method
        }

    </span>

    <strong>

        ${Align.formatCurrency(
            payment.amount
        )}

    </strong>

</div>
`)
.join("")}
`
        : `
<div>

Payment :

${{
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    wallet: "Wallet",
    bank: "Bank Transfer",
    other: "Other"
}[o.payment_method] || o.payment_method}

</div>
`;    

    document.getElementById("receipt")
        .innerHTML = `

<div class="center">

    ${
    o.restaurant_logo
        ? `
        <img
            src="${o.restaurant_logo}"
            alt=""
            onerror="this.remove();"
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

<div>

Order :
${o.order_number}

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

${Align.formatCurrency(o.subtotal, 2)}

</strong>

</div>

<div class="row">

<span>

GST

</span>

<strong>

${Align.formatCurrency(o.tax, 2)}

</strong>

</div>

<div class="row">

<span>

Discount

</span>

<strong>

-${Align.formatCurrency(
    o.discountAmount,
    2
)}

</strong>

</div>

<div class="line"></div>

<div class="row">

<strong>

TOTAL

</strong>

<strong>

${Align.formatCurrency(o.total, 2)}

</strong>

</div>

<div class="line"></div>

${paymentHtml}

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