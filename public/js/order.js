let allMenuItems = [];

let filteredMenuItems = [];

let selectedCategory = "all";

let selectedFoodType = "all";
let currentOrder = null;

if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}

const params =
    new URLSearchParams(
        window.location.search
    );
const areaId =

    params.get("area"); 
const kitchenBtn =
    document.getElementById("kitchenBtn");

if (kitchenBtn) {

    kitchenBtn.onclick = () => {

        const areaName =
    document.getElementById("areaTitle")?.textContent || "";

window.location.href =
    `/admin/kitchen.html?area=${areaId}&name=${encodeURIComponent(areaName)}`;

    };

}    
const goBack = () => {

    window.location.href =
        `/admin/area.html?id=${areaId}`;

};

document
    .getElementById("backBtn")
    ?.addEventListener(
        "click",
        goBack
    );

document
    .getElementById("backBtnMobile")
    ?.addEventListener(
        "click",
        goBack
    );   

const tableId =
    params.get("table");

const orderId =
    params.get("order");

const cartKey =
    tableId
        ? `cart_${tableId}`
        : `order_${orderId}`;

Align.Order.state.cartKey = cartKey;

Align.Order.cart.load();
let existingItems = [];    

async function loadMenu() {

    const data =
        await API.get("/api/menu/items/all");

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    allMenuItems =
        data.items.filter(
            item => item.is_available == 1
        );

    renderCategoryFilters();

    renderFoodFilters();

    applyFilters();

}
function renderMenu(items) {

    const menu =
        document.getElementById(
            "menuList"
        );

    menu.innerHTML = "";

    if (items.length === 0) {

        menu.innerHTML = `

<div class="rounded-lg border border-dashed p-8 text-center text-slate-500">

No menu items found

</div>

`;

        return;

    }

    items.forEach(item => {

        if (
    item.variants &&
    item.variants.length === 1 &&
    !selectedVariants[item.id]
) {
    selectedVariants[item.id] =
        item.variants[0].id;
}

        const variantsHtml =
(item.variants && item.variants.length)
? item.variants.map(v => `

<div class="mt-2 flex items-center justify-between rounded-lg border px-2 py-2">

    <div>

        <div class="text-sm font-medium">

            ${v.name}

        </div>

        <div class="text-xs text-slate-500">

            ${Align.formatCurrency(v.price)}

        </div>

    </div>

    <button
    onclick="addItem(
        ${item.id},
        '${item.name.replace(/'/g,"\\'")}',
        ${v.price},
        ${v.id},
        '${v.name.replace(/'/g,"\\'")}'
    )"
    class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700">

        +

    </button>

</div>

`).join("")
: "";

        menu.innerHTML += `

<div
class="rounded-xl border bg-white p-2.5 shadow-sm transition hover:shadow-md lg:p-4">

<div class="min-w-0">

<h3 class="truncate text-sm font-semibold lg:text-base">

${item.name}

</h3>

<p class="mt-1 text-xs text-slate-500 lg:text-sm">

${item.category}

</p>

${
!item.variants || item.variants.length === 0
? `
<div class="mt-2 flex items-center justify-between">

<div class="text-sm font-semibold text-blue-600">

${Align.formatCurrency(item.price)}

</div>

<button
onclick="addItem(
${item.id},
'${item.name.replace(/'/g,"\\'")}',
${item.price}
)"
class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700">

+

</button>

</div>
`
: ""
}

</div>

${variantsHtml}

</div>

`;

    });

}


function applyFilters() {

    const desktopSearch =
    document.getElementById("menuSearch");

const mobileSearch =
    document.getElementById("menuSearchMobile");

const keyword = (
    desktopSearch?.value ||
    mobileSearch?.value ||
    ""
)
.toLowerCase()
.trim();

    filteredMenuItems =
        allMenuItems.filter(item => {

            const searchMatch =

                item.name
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.category
                    .toLowerCase()
                    .includes(keyword);

            const categoryMatch =

                selectedCategory === "all"

                ||

                item.category_id ==
                selectedCategory;

            const foodMatch =

                selectedFoodType === "all"

                ||

                item.food_type ==
                selectedFoodType;

            return (

                searchMatch

                &&

                categoryMatch

                &&

                foodMatch

            );

        });

    renderMenu(
        filteredMenuItems
    );

}

async function initialize() {

    await loadMenu();

    await loadExistingOrder();

    renderCart();

}



document
    .getElementById("sendKitchenBtn")
    .addEventListener(
        "click",
        sendToKitchen
    );

const checkoutBtn =
    document.getElementById(
        "checkoutBtn"
    );

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        sendToKitchen
    );

}


initialize();
async function loadExistingOrder() {

    if (!tableId) return;

    const active =
        await API.get(
            `/api/orders/table/${tableId}`
        );    

    if (!active.hasActiveOrder) {
        return;
    }

    const order =
        await API.get(
            `/api/orders/${active.order.id}`
        );
    currentOrder =
    order.order;

    currentOrder = {

    ...order.order,

    ticket_id:
        active.order.ticket_id

};

    existingItems = order.items.map(item => ({

    id: item.menu_item_id,

    name: item.name,

    variant_name: item.variant_name,

    price: item.unit_price,

    quantity: item.quantity,

    order_item_id: item.id,

    pending_ticket_item_id:
        item.pending_ticket_item_id,

    ready_ticket_item_id:
        item.ready_ticket_item_id,

    active_ticket_item_id:
        item.active_ticket_item_id,

    pending_count:
        item.pending_count || 0,

    preparing_count:
        item.preparing_count || 0,

    ready_count:
        item.ready_count || 0,

    cancelled_count:
        item.cancelled_count || 0,

    served_count:
        item.served_count || 0

}));
console.log(order.items);

console.log(order.items[0]);

renderCart();

}

function addItem(
    menuItemId,
    itemName,
    unitPrice,
    variantId = null,
    variantName = null
) {

    Align.Order.cart.add({

        menu_item_id: menuItemId,

        item_name: itemName,

        variant_id: variantId,

        variant_name: variantName,

        unit_price: unitPrice

    });

    renderCart();

}


function renderCart() {
    const cart =

    Align.Order.state.cart;

    const cartDiv = document.getElementById("cart");

    if (
    existingItems.length === 0 &&
    cart.length === 0
) {

    cartDiv.innerHTML = "No Items";

    document.getElementById("total").textContent = "0";

    const mobileBar =
        document.getElementById("mobileCartBar");

    if (mobileBar) {

        mobileBar.classList.add("hidden");

    }

    document.getElementById("mobileItemCount").textContent =
        "0 Items";

    document.getElementById("mobileTotal").textContent =
        Align.formatCurrency(0);

    return;

}
const cartSheet =
    document.getElementById(
        "cartItemsList"
    );

if (cartSheet) {

    cartSheet.innerHTML = "";

}

    let total = 0;

    cartDiv.innerHTML = "";
    

    cart.forEach(item => {

        const itemTotal =

    item.quantity *

    item.unit_price;

        total += itemTotal;

        cartDiv.innerHTML += `
<div class="mb-3 rounded-lg border p-3">

    <div class="flex items-center justify-between">

        <div>

            <h4 class="font-semibold">

                ${item.item_name}
                ${
    item.variant_name
        ? `
<p class="text-xs text-blue-600">

${item.variant_name}

</p>
`
        : ""
}

            </h4>

            <p class="text-sm text-slate-500">

                ${Align.formatCurrency(item.unit_price)} each

            </p>

        </div>

        <strong>

           ${Align.formatCurrency(itemTotal)}

        </strong>

    </div>

    <div class="mt-3 flex items-center gap-3">

        <button
            onclick="decreaseQty(
    ${item.menu_item_id},
    ${item.variant_id || "null"}
)"
            class="h-9 w-9 rounded bg-red-500 text-white">

            -

        </button>

        <span class="text-lg font-semibold">

            ${item.quantity}

        </span>

        <button
            onclick="increaseQty(
    ${item.menu_item_id},
    ${item.variant_id || "null"}
)"
            class="h-9 w-9 rounded bg-green-600 text-white">

            +

        </button>

    </div>

</div>
`;
if (cartSheet) {

    cartSheet.innerHTML += `

<div class="mb-3 rounded-lg border p-3">

    <div class="flex items-center justify-between">

        <div>

            <h4 class="font-semibold">

                ${item.item_name}

                ${

                    item.variant_name

                    ? `

<p class="text-xs text-blue-600">

${item.variant_name}

</p>

`

                    : ""

                }

            </h4>

            <p class="text-sm text-slate-500">

                ${Align.formatCurrency(item.unit_price)} each

            </p>

        </div>

        <strong>

            ${Align.formatCurrency(itemTotal)}

        </strong>

    </div>

    <div class="mt-3 flex items-center gap-3">

        <button

            onclick="decreaseQty(${item.menu_item_id}, ${item.variant_id || "null"})"

            class="h-9 w-9 rounded bg-red-500 text-white">

            -

        </button>

        <span class="text-lg font-semibold">

            ${item.quantity}

        </span>

        <button

            onclick="increaseQty(${item.menu_item_id}, ${item.variant_id || "null"})"

            class="h-9 w-9 rounded bg-green-600 text-white">

            +

        </button>

    </div>

</div>

`;

}

    });

if (existingItems.length > 0) {

    // cartDiv.innerHTML += `
    //     <h3 class="mb-3 text-lg font-bold">

    //         Current Order

    //     </h3>
    // `;
    if (cartSheet) {

//     cartSheet.innerHTML += `
// <h3 class="mb-3 text-lg font-bold">

//     Current Order

// </h3>
// `;

}
    

    existingItems.forEach(item => {

        const total =
            item.price * item.quantity;

        cartDiv.innerHTML += `
<div class="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">

    <div class="flex justify-between">

        <div>

            <h4 class="font-semibold">

               ${item.name}

<small class="block text-slate-500">

${item.variant_name || ""}

</small>

            </h4>

            <p class="text-sm text-slate-500">

                Qty : ${item.quantity}

            </p>
            ${renderItemStatus(item)}

            ${canCancelItem(item) ? `
<button
    onclick="cancelOrderItem(${item.active_ticket_item_id})"
    class="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">

    Cancel Item

</button>
` : ""}

${canServeItem(item) ? `
<button
    onclick="serveOrderItem(${item.ready_ticket_item_id})"
    class="mt-2 ml-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">

    Served

</button>
` : ""}

        </div>

        <strong>

           ${Align.formatCurrency(total)}

        </strong>

    </div>

</div>
`;
if (cartSheet) {

    cartSheet.innerHTML += `
<div class="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">

    <div class="flex justify-between">

        <div>

            <h4 class="font-semibold">

                ${item.name}

                <small class="block text-slate-500">

                    ${item.variant_name || ""}

                </small>

            </h4>

            <p class="text-sm text-slate-500">

                Qty : ${item.quantity}

            </p>

            ${renderItemStatus(item)}

            ${canCancelItem(item) ? `
<button
    onclick="cancelOrderItem(${item.active_ticket_item_id})"
    class="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white">

    Cancel Item

</button>
` : ""}

            ${canServeItem(item) ? `
<button
    onclick="serveOrderItem(${item.ready_ticket_item_id})"
    class="mt-2 ml-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white">

    Served

</button>
` : ""}

        </div>

        <strong>

            ${Align.formatCurrency(total)}

        </strong>

    </div>

</div>
`;

}

    });

    // cartDiv.innerHTML += `
    //     <hr class="my-4">
    //     <h3 class="mb-3 text-lg font-bold">

    //         New Items

    //     </h3>
    // `;
    if (cartSheet) {

//     cartSheet.innerHTML += `
// <hr class="my-4">

// <h3 class="mb-3 text-lg font-bold">

//     New Items

// </h3>
// `;

}

}    

    document.getElementById("total").textContent =
    Align.formatCurrency(
        Align.Order.cart.total()
    );
        sessionStorage.setItem(
    cartKey,
    JSON.stringify(cart)
);
const totalItems =
    cart.reduce(

        (sum, item) =>

            sum + item.quantity,

        0

    );

const mobileBar =
    document.getElementById(
        "mobileCartBar"
    );

if (mobileBar) {

    if (
        totalItems === 0 &&
        existingItems.length === 0
    ) {

        mobileBar.classList.add(
            "hidden"
        );

    } else {

        mobileBar.classList.remove(
            "hidden"
        );

    }

}

document.getElementById(
    "mobileItemCount"
).textContent =
`${totalItems} Item${totalItems === 1 ? "" : "s"}`;

updateOrderAction();
document.getElementById(
    "mobileTotal"
).textContent =
Align.formatCurrency(
    Align.Order.cart.total()
);


document.getElementById("mobileItemCount").textContent =
    `${totalItems} Item${totalItems === 1 ? "" : "s"}`;

document.getElementById("mobileTotal").textContent =
    Align.formatCurrency(
        Align.Order.cart.total()
    );

}
function updateOrderAction() {

    const boxes = [

        document.getElementById(
            "orderAction"
        ),

        document.getElementById(
            "mobileOrderAction"
        )

    ].filter(Boolean);

    if (
        boxes.length === 0 ||
        !currentOrder
    ) {

        return;

    }

    boxes.forEach(box => {

        box.classList.add(
            "hidden"
        );

        box.innerHTML = "";

    });

    if (existingItems.length === 0) {

        return;

    }

    const pending =
        existingItems.some(
            i => i.pending_count > 0
        );

    const preparing =
        existingItems.some(
            i => i.preparing_count > 0
        );

    const ready =
        existingItems.some(
            i => i.ready_count > 0
        );

    const served =
        existingItems.some(
            i => i.served_count > 0
        );

    const cancelled =
        existingItems.some(
            i => i.cancelled_count > 0
        );

    let html = "";
    let handler = null;

    // Billing Under Process

    if (
        currentOrder.status ===
        "ready_for_billing"
    ) {

        html = `
<button
    disabled
    class="w-full cursor-not-allowed rounded-xl bg-amber-500 py-3 font-semibold text-white opacity-80">

    Billing Under Process

</button>
`;

    }

    // Send To Billing

    else if (

        !pending &&
        !preparing &&
        !ready &&
        served

    ) {

        html = `
<button
    class="action-btn w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">

    Send To Billing

</button>
`;

        handler = () =>
            sendToBilling(
                currentOrder.id
            );

    }

    // Close Order

    else if (

        !pending &&
        !preparing &&
        !ready &&
        !served &&
        cancelled

    ) {

        html = `
<button
    class="action-btn w-full rounded-xl bg-red-600 py-3 font-semibold text-white">

    Close Order

</button>
`;

        handler = () =>
            closeCancelledOrder(
                currentOrder.ticket_id
            );

    }

    if (!html) {

        return;

    }

    boxes.forEach(box => {

        box.classList.remove(
            "hidden"
        );

        box.innerHTML = html;

        if (handler) {

            box.querySelector(
                ".action-btn"
            ).onclick = handler;

        }

    });

}

function increaseQty(
    menuItemId,
    variantId = null
) {

    Align.Order.cart.increase(
        menuItemId,
        variantId
    );

    renderCart();

}

function decreaseQty(
    menuItemId,
    variantId = null
) {

    Align.Order.cart.decrease(
        menuItemId,
        variantId
    );

    renderCart();

}
function openCart() {

    document
        .getElementById("cartSheet")
        .classList.remove("hidden");

    renderCart();

}

function closeCart() {

    document
        .getElementById("cartSheet")
        .classList.add("hidden");

}
async function sendToKitchen() {

    if (Align.Order.state.cart.length === 0) {

        Toast.show(
            "Cart is empty",
            "error"
        );

        return;

    }

    const sendButton =
        document.getElementById(
            "sendKitchenBtn"
        );

    const cartButton =
        document.getElementById(
            "checkoutBtn"
        );

    if (sendButton) {

    sendButton.disabled = true;

    sendButton.textContent = "Sending...";

}

if (cartButton) {

    cartButton.disabled = true;

    cartButton.textContent = "Sending...";

}

    try {

        const payload = {

            table_id: Number(tableId),

            items: Align.Order.state.cart.map(item => ({

                menu_item_id: item.menu_item_id,

                variant_id: item.variant_id,

                quantity: item.quantity,

                notes: item.notes || ""

            }))

        };

        const data =
            await API.post(
                "/api/orders/checkout",
                payload
            );
            console.log(data);

        if (!data.success) {

            Toast.show(
                data.message,
                "error"
            );

            return;

        }

        Align.Order.cart.clear();

        if (typeof updateCartSummary === "function") {

    updateCartSummary();

}

        if (typeof closeCart === "function") {

    closeCart();

}

        if (typeof loadCurrentOrder === "function") {

    await loadCurrentOrder();

}

        if (typeof loadTable === "function") {

    await loadTable();

}

        Toast.show(
            "Order sent successfully",
            "success"
        );
        if (typeof loadExistingOrder === "function") {

    await loadExistingOrder();

}

if (typeof loadMenu === "function") {

    await loadMenu();

}

if (typeof renderCart === "function") {

    renderCart();

}

    }
    catch (err) {

        Toast.show(
            err.message,
            "error"
        );

    }
    finally {

       if (sendButton) {

    sendButton.disabled = false;

    sendButton.textContent =
        "Send To Kitchen";

}

if (cartButton) {

    cartButton.disabled = false;

    cartButton.textContent =
        "Send To Kitchen";

}

    }

}

function renderCategoryFilters() {

    const container =
        document.getElementById(
            "categoryFilters"
        );

    container.innerHTML = "";

    const categories = [

        {

            id: "all",

            name: "All"

        },

        ...new Map(

            allMenuItems.map(item => [

                item.category_id,

                {

                    id: item.category_id,

                    name: item.category

                }

            ])

        ).values()

    ];

    categories.forEach(cat => {

        container.innerHTML += `

<button

onclick="selectCategory('${cat.id}')"

class="category-chip flex h-8 items-center rounded-full border px-3 text-xs whitespace-nowrap lg:h-10 lg:px-5 lg:text-sm"

data-id="${cat.id}">

${cat.name}

</button>

`;

    });

    updateCategorySelection();

}
function selectCategory(id) {

    selectedCategory = id;

    updateCategorySelection();

    applyFilters();

}
function updateCategorySelection() {

    document

        .querySelectorAll(
            ".category-chip"
        )

        .forEach(btn => {

            if (

                btn.dataset.id ==
                selectedCategory

            ) {

                btn.className =
"category-chip rounded-full bg-blue-600 px-3 py-1.5 text-xs text-white lg:px-4 lg:py-2 lg:text-sm";

            } else {

                btn.className =
"category-chip flex h-8 items-center rounded-full border px-3 text-xs whitespace-nowrap lg:h-10 lg:px-5 lg:text-sm";;

            }

        });

}

function renderFoodFilters() {

    const container =
        document.getElementById(
            "foodFilters"
        );

    container.innerHTML = "";

    const icons = {

    veg: "🟢",

    egg: "🥚",

    non_veg: "🔴",

    vegan: "🌱",

    jain: "🟡",

    satvik: "🪷"

};

    const foodTypes = [

        {

            id: "all",

            name: "All"

        },

        ...new Map(

            allMenuItems.map(item => [

                item.food_type,

                {

                    id: item.food_type,

                    name:

                        `${icons[item.food_type] || "🍽️"} ` +

                        item.food_type

                            .replace(/_/g, " ")

                            .replace(/\b\w/g, c => c.toUpperCase())

                }

            ])

        ).values()

    ];

    foodTypes.forEach(type => {

        container.innerHTML += `

<button

onclick="selectFoodType('${type.id}')"

class="food-chip rounded-full border px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm"

data-id="${type.id}">

${type.name}

</button>

`;

    });

    updateFoodSelection();

}
function selectFoodType(id) {

    selectedFoodType = id;

    updateFoodSelection();

    applyFilters();

}
function updateFoodSelection() {

    document

        .querySelectorAll(".food-chip")

        .forEach(btn => {

            if (

                btn.dataset.id ==
                selectedFoodType

            ) {

                btn.className =
"food-chip rounded-full bg-blue-600 px-3 py-1.5 text-xs text-white lg:px-4 lg:py-2 lg:text-sm";

            }

            else {

                btn.className =
"food-chip rounded-full border px-3 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm";

            }

        });

}
const desktopSearch =
    document.getElementById("menuSearch");

const mobileSearch =
    document.getElementById("menuSearchMobile");
document
    .getElementById("mobileViewCartBtn")
    ?.addEventListener(
        "click",
        openCart
    );    

desktopSearch?.addEventListener("input", () => {

    if (mobileSearch) {

        mobileSearch.value =
            desktopSearch.value;

    }

    applyFilters();

});

mobileSearch?.addEventListener("input", () => {

    if (desktopSearch) {

        desktopSearch.value =
            mobileSearch.value;

    }
    


    applyFilters();
    

});

async function sendToBilling(orderId) {

    try {

        const data =
            await API.patch(
                `/api/orders/${orderId}/send-to-billing`
            );

        if (!data.success) {

            Toast.show(
                data.message,
                "error"
            );

            return;

        }

        Toast.show(
            "Sent To Billing",
            "success"
        );

        await loadExistingOrder();

        renderCart();

    }

    catch (err) {

        Toast.show(
            err.message,
            "error"
        );

    }

}
async function closeCancelledOrder(ticketId) {
    

    const data =
        await API.patch(
            `/api/kitchen/${ticketId}/close-cancelled`
        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    Toast.show(
        "Order Closed",
        "success"
    );

    window.location.href =
        `/admin/area.html?id=${areaId}`;

}