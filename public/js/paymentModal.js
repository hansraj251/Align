let paymentModal;
let currentPaymentOrder = null;
let isPaymentProcessing = false;
async function loadPaymentModal()
{
    const container = document.getElementById("paymentModalContainer");

    if (!container)
    {
        return;
    }

    const response = await fetch("/components/paymentModal.html");

    const html = await response.text();

    container.innerHTML = html;

    paymentModal = document.getElementById("paymentModal");

    bindPaymentModalEvents();
}


function bindPaymentModalEvents()
{
    document
        .getElementById("closePaymentModal")
        .addEventListener("click", closePaymentModal);

    document
        .getElementById("cancelPaymentBtn")
        .addEventListener("click", closePaymentModal);

    document
    .getElementById("markPaidBtn")
    .addEventListener(
        "click",
        () => processPayment(false)
    );

    document
    .getElementById("printBillBtn")
    .addEventListener(
        "click",
        () => processPayment(true)
    );

    document
        .getElementById("discountType")
        ?.addEventListener(
            "change",
            updatePaymentSummary
        );

    document
        .getElementById("discountValue")
        ?.addEventListener(
            "input",
            updatePaymentSummary
        );

    document
    .getElementById("splitPayment")
    ?.addEventListener(
        "change",
        toggleSplitPayment
    );    
    document
    .getElementById(
        "addSplitPaymentBtn"
    )
    ?.addEventListener(
        "click",
        () =>
        {
            addSplitPaymentRow(
    getAvailablePaymentMethod(),
    getRemainingAmount().toFixed(2)
);
        }
    );

    paymentModal.addEventListener("click", function (event)
    {
        if (event.target === paymentModal)
        {
            closePaymentModal();
        }
    });
}

function openPaymentModal(order)
{
    if (!paymentModal)
    {
        return;
    }

   if (order)
{
    currentPaymentOrder = order;

    populatePaymentSummary(order);

    updatePaymentSummary();
}

    paymentModal.classList.remove("hidden");

    paymentModal.classList.add("flex");
}

function closePaymentModal()
{
    if (!paymentModal)
    {
        return;
    }

    paymentModal.classList.remove("flex");

    paymentModal.classList.add("hidden");

    resetPaymentModal();
}

function resetPaymentModal()
{
    const notes = document.getElementById("paymentNotes");

    if (notes)
    {
        notes.value = "";
    }
    currentPaymentOrder = null;

document.getElementById(
    "discountType"
).value = "amount";

document.getElementById(
    "discountValue"
).value = 0;

document.getElementById(
    "paymentSummary"
).innerHTML = "";
document.getElementById(
    "paymentMethod"
).value = "cash";

document.getElementById(
    "splitPayment"
).checked = false;

document.getElementById(
    "splitPaymentContainer"
).classList.add(
    "hidden"
);
const discountType =
    document.getElementById(
        "discountType"
    );

const discountValue =
    document.getElementById(
        "discountValue"
    );

discountType.disabled =
    false;

discountValue.disabled =
    false;

discountType.classList.remove(
    "bg-slate-100",
    "cursor-not-allowed"
);

discountValue.classList.remove(
    "bg-slate-100",
    "cursor-not-allowed"
);
}
function populatePaymentSummary(order)
{
    const summary = document.getElementById(
        "paymentOrderSummary"
    );

    if (!summary)
    {
        return;
    }

    summary.innerHTML = `
<div class="flex justify-between">
    <span>Table</span>
    <span class="font-medium">
        ${order.table_name ?? "-"}
    </span>
</div>

<div class="flex justify-between">
    <span>Order</span>
    <span class="font-medium">
        #${order.id}
    </span>
</div>

<div class="flex justify-between">
    <span>Subtotal</span>
    <span>
    ${Align.formatCurrency(Number(order.subtotal))}
</span>
</div>

<div class="flex justify-between">
    <span>Tax</span>
    <span>
    ${Align.formatCurrency(Number(order.tax))}
</span>
</div>

<hr>

<div class="flex justify-between text-base font-semibold">
    <span>Total</span>
    <span>
    ${Align.formatCurrency(Number(order.total))}
</span>
</div>
`;
}
function updatePaymentSummary()
{
    if (!currentPaymentOrder)
    {
        return;
    }

    const type =
        document.getElementById(
            "discountType"
        ).value;

    const value =
        Number(
            document.getElementById(
                "discountValue"
            ).value
        ) || 0;

    const subtotal =
        Number(currentPaymentOrder.subtotal);

    const tax =
        Number(currentPaymentOrder.tax);

    let discount = 0;

    if (type === "amount")
    {
        discount = value;
    }
    else
    {
        discount =
            subtotal * value / 100;
    }

    if (discount > subtotal)
    {
        discount = subtotal;
    }

    const grandTotal =
    subtotal -
    discount +
    tax;

currentPaymentOrder.payable =
    grandTotal;

document.getElementById(
    "paymentSummary"
).innerHTML = `
<div class="flex justify-between">
    <span>Subtotal</span>
    <span>${Align.formatCurrency(subtotal)}</span>
</div>

<div class="flex justify-between">
    <span>Discount</span>
    <span>-${Align.formatCurrency(discount)}</span>
</div>

<div class="flex justify-between">
    <span>Tax</span>
    <span>${Align.formatCurrency(tax)}</span>
</div>

<hr>

<div class="flex justify-between text-base font-semibold">
    <span>Payable</span>
    <span>${Align.formatCurrency(grandTotal)}</span>
</div>
`;

if (
    document.getElementById(
        "splitPayment"
    ).checked
)
{
    updateLastSplitAmount();
}
else
{
    updateSplitSummary();
}
}

function toggleSplitPayment()
{
    
    const checkbox =
        document.getElementById(
            "splitPayment"
        );

    const container =
        document.getElementById(
            "splitPaymentContainer"
        );

        const discountType =
    document.getElementById(
        "discountType"
    );

const discountValue =
    document.getElementById(
        "discountValue"
    );
    discountType.disabled =
    checkbox.checked;

discountValue.disabled =
    checkbox.checked;

discountType.classList.toggle(
    "bg-slate-100",
    checkbox.checked
);

discountValue.classList.toggle(
    "bg-slate-100",
    checkbox.checked
);

discountType.classList.toggle(
    "cursor-not-allowed",
    checkbox.checked
);

discountValue.classList.toggle(
    "cursor-not-allowed",
    checkbox.checked
);
    const paymentMethodContainer =
    document.getElementById(
        "paymentMethodContainer"
    );

if (paymentMethodContainer)
{
    paymentMethodContainer.classList.toggle(
        "hidden",
        checkbox.checked
    );
}    

    container.classList.toggle(
        "hidden",
        !checkbox.checked
    );

    if (
        checkbox.checked &&
        document.getElementById(
            "splitPayments"
        ).children.length === 0
    )
    {
        addSplitPaymentRow(
    getAvailablePaymentMethod(),
    currentPaymentOrder.payable.toFixed(2)
);
updateLastSplitAmount();
    }

    updateSplitSummary();
}
function updateSplitSummary()
{
    if (!currentPaymentOrder)
    {
        return;
    }
    const splitEnabled =
    document.getElementById(
        "splitPayment"
    ).checked;

if (!splitEnabled)
{
    document.getElementById(
        "markPaidBtn"
    ).disabled = false;

    document.getElementById(
        "printBillBtn"
    ).disabled = false;

    return;
}

    const payable =
    Number(
        currentPaymentOrder.payable ??
        currentPaymentOrder.total
    );

    let paid = 0;

    document
        .querySelectorAll(
            ".split-amount"
        )
        .forEach(input =>
        {
            paid +=
                Number(
                    input.value
                ) || 0;
        });

    const remaining =
        Math.max(
            0,
            payable - paid
        );


    document.getElementById(
        "markPaidBtn"
    ).disabled =
        remaining > 0;

    document.getElementById(
        "printBillBtn"
    ).disabled =
        remaining > 0;
}
async function processPayment(
    shouldPrint = false
)
{
    if (isPaymentProcessing)
    {
        return;
    }

    isPaymentProcessing = true;

    let receiptWindow = null;

    if (shouldPrint)
    {
        receiptWindow =
            window.open(
                "",
                "_blank"
            );
    }

    const splitPayments = [];

document
    .querySelectorAll(
        "#splitPayments > div"
    )
    .forEach(row =>
    {
        splitPayments.push({

            method:
                row.querySelector(
                    ".split-method"
                ).value,

            amount:
                Number(
                    row.querySelector(
                        ".split-amount"
                    ).value
                ) || 0

        });
    });
    const result = await API.post(
    "/api/billing/pay",
    {
        orderId: currentPaymentOrder.id,

        discountType:
            document.getElementById(
                "discountType"
            ).value,

        discountValue:
            Number(
                document.getElementById(
                    "discountValue"
                ).value
            ),

        paymentMethod:
            document.getElementById(
                "paymentMethod"
            ).value,

        splitPayment:
            document.getElementById(
                "splitPayment"
            ).checked,

        splitPayments
    }
);


if (!result.success)
{
    receiptWindow?.close();

    Toast.show(
        result.message,
        "error"
    );

    isPaymentProcessing = false;

    return;
}

const orderId =
    currentPaymentOrder.id;

closePaymentModal();

if (shouldPrint)
{
    if (receiptWindow)
    {
        receiptWindow.location =
            `/admin/receipt.html?orderId=${orderId}`;
    }

    else
    {
        window.open(
            `/admin/receipt.html?orderId=${orderId}`,
            "_blank"
        );
    }

    window.location.reload();

    return;
}

window.location.reload();

isPaymentProcessing = false;
}

function addSplitPaymentRow(
    method = "cash",
    amount = ""
)
{
    const container =
        document.getElementById(
            "splitPayments"
        );

    const row =
        document.createElement("div");

    row.className =
        "grid grid-cols-[1fr_120px_40px] gap-2";

    row.innerHTML = `
<select
    class="split-method rounded border p-2"
>
    <option value="cash">
        Cash
    </option>

    <option value="upi">
        UPI
    </option>

    <option value="card">
        Card
    </option>

    <option value="wallet">
        Wallet
    </option>

    <option value="bank">
        Bank
    </option>

    <option value="other">
        Other
    </option>

</select>

<input
    type="number"
    min="0"
    step="0.01"
    value="${amount}"
    class="split-amount rounded border p-2"
>

<button
    type="button"
    class="remove-split rounded border text-red-600"
>
    ✕
</button>
`;

    row.querySelector(
        ".split-method"
    ).value = method;
    row
    .querySelector(
        ".split-method"
    )
    .addEventListener(
        "change",
        refreshSplitPaymentMethods
    );

    row
    .querySelector(
        ".split-amount"
    )
    .addEventListener(
        "input",
        updateLastSplitAmount
    );

    row
        .querySelector(
            ".remove-split"
        )
        .addEventListener(
            "click",
            () =>
            {
               const rows =
    Array.from(
        document.querySelectorAll(
            "#splitPayments > div"
        )
    );

if (rows.length === 1)
{
    Toast.show(
        "At least one payment method is required",
        "warning"
    );

    return;
}

row.remove();

refreshSplitPaymentMethods();

updateLastSplitAmount();
            }
        );

    container.appendChild(row);

refreshSplitPaymentMethods();

updateLastSplitAmount();
}
function refreshSplitPaymentMethods()
{
    const selects =
        document.querySelectorAll(
            ".split-method"
        );

    const selectedMethods =
        Array.from(selects)
            .map(select => select.value);

    selects.forEach(currentSelect =>
    {
        const currentValue =
            currentSelect.value;

        currentSelect
            .querySelectorAll("option")
            .forEach(option =>
            {
                option.hidden =
                    option.value !== currentValue &&
                    selectedMethods.includes(
                        option.value
                    );
            });
    });

    const totalMethods = 6;

    const usedMethods =
        new Set(selectedMethods);

    document.getElementById(
        "addSplitPaymentBtn"
    ).classList.toggle(
        "hidden",
        usedMethods.size >= totalMethods
    );
    const amountInputs =
    document.querySelectorAll(
        ".split-amount"
    );

amountInputs.forEach(
    (input, index) =>
    {
        input.readOnly =
    index === 0;

input.classList.toggle(
    "bg-slate-100",
    input.readOnly
);

input.classList.toggle(
    "cursor-not-allowed",
    input.readOnly
);

    }
);
}
function getAvailablePaymentMethod()
{
    const methods = [
        "cash",
        "upi",
        "card",
        "wallet",
        "bank",
        "other"
    ];

    const used =
        Array.from(
            document.querySelectorAll(
                ".split-method"
            )
        ).map(select => select.value);

    return methods.find(
        method => !used.includes(method)
    ) || methods[0];
}
function getRemainingAmount()
{
    const payable =
        Number(
            currentPaymentOrder.payable ??
            currentPaymentOrder.total
        );

    let paid = 0;

    document
        .querySelectorAll(
            ".split-amount"
        )
        .forEach(input =>
        {
            paid +=
                Number(input.value) || 0;
        });

    return Math.max(
        0,
        payable - paid
    );
}

function updateLastSplitAmount()
{
    const inputs =
        document.querySelectorAll(
            ".split-amount"
        );

    if (inputs.length === 0)
    {
        return;
    }

    const payable =
        Number(
            currentPaymentOrder.payable ??
            currentPaymentOrder.total
        );

    let paid = 0;

for (
    let i = 1;
    i < inputs.length;
    i++
)
{
    paid +=
        Number(
            inputs[i].value
        ) || 0;
}

inputs[0].value =
    Math.max(
        0,
        payable - paid
    ).toFixed(2);

    updateSplitSummary();
}