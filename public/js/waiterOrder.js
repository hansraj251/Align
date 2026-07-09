Auth.requireLogin();

const params =
    new URLSearchParams(
        window.location.search
    );

const tableId =
    Number(
        params.get("table")
    );

let allMenuItems = [];

let filteredMenuItems = [];

let selectedCategory = "all";
let selectedFoodType = "all";
let selectedVariants = {};


async function initialize() {

    if (typeof loadTable === "function") {

    await loadTable();

}

    await loadCategories();

    await loadMenu();

    if (typeof loadCurrentOrder === "function") {

    await loadCurrentOrder();

}

}


initialize();



document
    .getElementById("menuSearch")
    .addEventListener(
        "input",
        applyFilters
    );

document
    .getElementById("viewCartBtn")
    .addEventListener(
        "click",
        openCart
    );
const sendKitchenBtn =
    document.getElementById(
        "sendKitchenBtn"
    );

if (sendKitchenBtn) {

    sendKitchenBtn.addEventListener(
        "click",
        sendToKitchen
    );

}
const sendKitchenBtnBottom =
    document.getElementById(
        "sendKitchenBtnBottom"
    );

if (sendKitchenBtnBottom) {

    sendKitchenBtnBottom.addEventListener(
        "click",
        sendToKitchen
    );

}

setInterval(

    loadCurrentOrder,

    5000

);
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
        "sendKitchenBtnBottom"
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

        if (!data.success) {

            Toast.show(
                data.message,
                "error"
            );

            return;

        }

        Align.Order.cart.clear();

renderCart();

updateCartSummary();

renderMenu(filteredMenuItems);

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

async function loadTable() {

    const data =
        await API.get(
            "/api/tables"
        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    const table =
        data.tables.find(
            t => t.id === tableId
        );

    if (!table) {

        Toast.show(
            "Table not found",
            "error"
        );

        return;

    }

    document.getElementById(
        "tableTitle"
    ).textContent =
        table.name;

    document.getElementById(
        "tableStatus"
    ).textContent =
        table.status;
    
    Align.Order.state.cartKey =
    `waiter_cart_${tableId}`;

Align.Order.cart.load();

if (typeof updateCartSummary === "function") {

    updateCartSummary();

}    

}
let allCategories = [];
async function loadCategories() {

    const data =
        await API.get(
            "/api/menu/categories"
        );

    if (!data.success) {

        return;

    }

    allCategories = data.categories;

renderCategories(
    allCategories
);

}
function renderCategories(
    categories
) {

    const container =
        document.getElementById(
            "categoryList"
        );

    container.innerHTML = "";

    container.innerHTML += `

<button

class="${
selectedCategory === "all"
? "text-blue-600 transition hover:bg-blue-200 hover:text-blue-700"
: "border bg-white"
} flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium"

onclick="selectCategory('all')">

All

</button>

`;

    categories.forEach(category => {

        container.innerHTML += `

<button

class="${
selectedCategory == category.id
? "text-blue-600 transition hover:bg-blue-200 hover:text-blue-700"
: "border bg-white"
} flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium"

onclick="selectCategory(${category.id})">

${category.name}

</button>

`;

    });

}
function selectCategory(categoryId) {

    selectedCategory = categoryId;

    renderCategories(
        allCategories
    );

    applyFilters();

}

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

    allMenuItems = data.items;

renderFoodTypes();

applyFilters();

}
function getMenuQty(
    menuItemId,
    variantId = null
) {

    let qty = 0;

    Align.Order.state.cart.forEach(item => {

        if (

            item.menu_item_id === menuItemId

            &&

            (item.variant_id || null) === (variantId || null)

        ) {

            qty += item.quantity;

        }

    });

    return qty;

}
function renderMenuControls(
    item
) {

    const qty =
        getMenuQty(item.id);

    return `

<div
id="menu-controls-${item.id}"
class="flex items-center gap-2">

${
qty > 0
? `
<button
onclick="decreaseMenuQty(${item.id})"
class="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">

−

</button>

<span class="w-6 text-center font-semibold">

${qty}

</span>
`
: ""
}

<button

onclick="addItem(
${item.id},
'${item.name.replace(/'/g,"\\'")}',
${item.price}
)"

class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">

+

</button>

</div>

`;

}
function renderVariantControls(
    item,
    variant
) {

    const qty =
        getMenuQty(
            item.id,
            variant.id
        );

    return `

<div
id="variant-controls-${item.id}-${variant.id}"
class="flex items-center gap-2">

${
qty > 0
? `
<button
onclick="decreaseQty(${item.id}, ${variant.id})"
class="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">

−

</button>

<span class="w-6 text-center font-semibold">

${qty}

</span>
`
: ""
}

<button

onclick="addItem(
${item.id},
'${item.name.replace(/'/g,"\\'")}',
${variant.price},
${variant.id},
'${variant.name.replace(/'/g,"\\'")}'
)"

class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">

+

</button>

</div>

`;

}
function updateMenuControls(
    menuItemId
) {

    const item =
        allMenuItems.find(
            i => i.id === menuItemId
        );

    if (!item) return;

    const controls =
        document.getElementById(
            `menu-controls-${menuItemId}`
        );

    if (!controls) return;

    controls.outerHTML =
        renderMenuControls(item);

}
function renderMenu(items) {

    const menu =
        document.getElementById(
            "menuList"
        );

    menu.innerHTML = "";
    let html = "";

    if (!items.length) {

    menu.innerHTML = `
        <div class="rounded-xl bg-white p-6 text-center">

            No menu items

        </div>
    `;

    return;

}

   items.forEach(item => {
    

    const hasVariants =
        item.variants &&
        item.variants.length;
        const qty = getMenuQty(item.id);

    html += `

<div
id="menu-card-${item.id}"
class="rounded-lg bg-white p-3 shadow-sm">

<div class="flex items-center justify-between">

<div>

<h3 class="text-[15px] font-semibold leading-5">

${item.name}

</h3>

<p class="text-xs text-slate-500">

${item.category}

</p>

${
    hasVariants
        ? `
        `
        : `
        <p class="mt-1 text-base text-blue-600 transition hover:bg-blue-200 hover:text-blue-700">

           ${Align.formatCurrency(item.price)}

        </p>
        `
}

</div>

${
!hasVariants
? renderMenuControls(item)
: ""
}

</div>

${
hasVariants
? item.variants.map(v => {

    const variantQty =
        getMenuQty(item.id, v.id);

    return `

<div
id="variant-${item.id}-${v.id}"
class="mt-3 flex items-center justify-between rounded-lg border px-2 py-1.5">

<div>

${v.name}

<span class="ml-2 text-slate-500">

${Align.formatCurrency(v.price)}

</span>

</div>

${renderVariantControls(item, v)}

</div>

`;
}).join("")
: ""
}

</div>

`;

});

menu.innerHTML = html;

}
function updateVariantControls(
    menuItemId,
    variantId
) {

    const item =
        allMenuItems.find(
            i => i.id === menuItemId
        );

    if (!item) return;

    const variant =
        item.variants.find(
            v => v.id === variantId
        );

    if (!variant) return;

    const controls =
        document.getElementById(
            `variant-controls-${menuItemId}-${variantId}`
        );

    if (!controls) return;

    controls.outerHTML =
        renderVariantControls(
            item,
            variant
        );

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

    if (typeof updateCartSummary === "function") {

    updateCartSummary();

}

renderCart();

updateCartSummary();

if (variantId) {

    updateVariantControls(
        menuItemId,
        variantId
    );

}
else {

    updateMenuControls(
        menuItemId
    );

}

}
function updateCartSummary() {

    const totalItems =
        Align.Order.state.cart.reduce(

            (sum,item)=>

                sum + item.quantity,

            0

        );

    document.getElementById(
        "cartItems"
    ).textContent =
        `${totalItems} Item${totalItems===1?"":"s"}`;

    document.getElementById(
    "cartTotal"
).textContent =
    Align.formatCurrency(
        Align.Order.cart.total(),
        2
    );

}
function applyFilters() {

    const keyword =
        document
            .getElementById("menuSearch")
            .value
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
            const foodMatch =

    selectedFoodType === "all"

    ||

    item.food_type === selectedFoodType;        

            const categoryMatch =

    selectedCategory === "all"

    ||

    Number(item.category_id) === Number(selectedCategory);

            return (

    searchMatch

    &&

    categoryMatch

    &&

    foodMatch

);

        });

    renderMenu(filteredMenuItems);

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

function renderCart() {

    const cartTotal =
        document.getElementById("cartTotal");

    if (cartTotal) {

        cartTotal.textContent =
            Align.formatCurrency(
                Align.Order.cart.total(),
                2
            );

    }

    const cartSheetTotal =
        document.getElementById("cartSheetTotal");

    if (cartSheetTotal) {

        cartSheetTotal.textContent =
            Align.formatCurrency(
                Align.Order.cart.total(),
                2
            );

    }

}
function increaseQty(
    menuItemId,
    variantId = null
) {

    Align.Order.cart.increase(
        menuItemId,
        variantId
    );

    if (typeof updateCartSummary === "function") {

    updateCartSummary();

}

renderCart();

updateCartSummary();

if (variantId) {

    updateVariantControls(
        menuItemId,
        variantId
    );

}
else {

    updateMenuControls(
        menuItemId
    );

}

}

function decreaseQty(
    menuItemId,
    variantId = null
) {

    Align.Order.cart.decrease(
        menuItemId,
        variantId
    );

    if (typeof updateCartSummary === "function") {

    updateCartSummary();

}

renderCart();

updateCartSummary();

if (variantId) {

    updateVariantControls(
        menuItemId,
        variantId
    );

}
else {

    updateMenuControls(
        menuItemId
    );

}

}
function decreaseMenuQty(
    menuItemId
) {

    decreaseQty(menuItemId);

}

async function loadCurrentOrder() {

    const data =
        await API.get(
            `/api/orders/table/${tableId}`
        );
        

    const box =
        document.getElementById(
            "currentOrder"
        );

    if (

        !data.success ||

        !data.hasActiveOrder

    ) {

        box.classList.add(
            "hidden"
        );

        return;

    }

    box.classList.remove(
        "hidden"
    );

    box.innerHTML = `

<h2 class="mb-3 text-base font-bold">

Current Order

</h2>

${data.order.items.map(item => `

<div class="mb-3 rounded-xl border p-3">

<div class="flex justify-between">

<div>

<div class="font-semibold">

${item.item_name}

</div>

<div class="text-sm text-slate-500">

${item.variant_name || ""}

</div>

</div>

<div>

×${item.quantity}

</div>

</div>

<div class="mt-2 text-sm space-y-1">

    ${
        item.pending_count > 0
        ? `
        <div class="text-orange-600">

            Pending : ${item.pending_count}

        </div>
        `
        : ""
    }

    ${
        item.preparing_count > 0
        ? `
        <div class="text-yellow-600">

            Preparing : ${item.preparing_count}

        </div>
        `
        : ""
    }

    ${
        item.ready_count > 0
        ? `
        <div class="text-green-600 font-medium">

            Ready : ${item.ready_count}

        </div>
        `
        : ""
    }
    ${
    item.cancelled_count > 0
    ? `
    <div class="text-red-600 font-medium">

        Cancelled

    </div>
    `
    : ""
}

${
    item.served_count > 0
    ? `
    <div class="text-blue-600 font-medium">

        Served

    </div>
    `
    : ""
}

</div>
<div class="mt-3 flex gap-2">

${

item.pending_count > 0

?

`

<button
    onclick="cancelItem(${item.pending_ticket_item_id})"
    class="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white">

    Cancel

</button>

`

: ""

}

${

item.ready_count > 0

?

`

<button
    onclick="serveItem(${item.ready_ticket_item_id})"
    class="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white">

    Served

</button>

`

: ""

}

</div>

</div>

`).join("")}

`;
const actionBox =
    document.getElementById(
        "orderAction"
    );

actionBox.classList.add("hidden");
actionBox.innerHTML = "";

const items =
    data.order.items;

const pending =
    items.some(
        i => i.pending_count > 0
    );

const preparing =
    items.some(
        i => i.preparing_count > 0
    );

const ready =
    items.some(
        i => i.ready_count > 0
    );

const served =
    items.some(
        i => i.served_count > 0
    );

const cancelled =
    items.some(
        i => i.cancelled_count > 0
    );

actionBox.innerHTML = "";
actionBox.classList.add("hidden");

if (
    data.order.status ===
    "ready_for_billing"
) {

    actionBox.classList.remove(
        "hidden"
    );

    actionBox.innerHTML = `

<button
    disabled
    class="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white cursor-not-allowed opacity-80">

    Billing Under Process

</button>

`;

    return;

}

if (
    !pending &&
    !preparing &&
    !ready &&
    served
) {

    actionBox.classList.remove("hidden");

    actionBox.innerHTML = `

<button
    id="sendBillingBtn"
    class="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">

    Send To Billing

</button>

`;
document
    .getElementById("sendBillingBtn")
    .addEventListener(
        "click",
        () => sendToBilling(
            data.order.id
        )
    );

}

else if (

    !pending &&
    !preparing &&
    !ready &&
    !served &&
    cancelled

) {

    actionBox.classList.remove("hidden");

    actionBox.innerHTML = `

<button
    id="closeOrderBtn"
    class="w-full rounded-xl bg-red-600 py-3 font-semibold text-white">

    Close Order

</button>

`;
document
    .getElementById(
        "closeOrderBtn"
    )
    .addEventListener(
        "click",
        () => closeCancelledOrder(
    data.order.ticket_id
)
    );

}    

}

function renderFoodTypes() {

    const container =
        document.getElementById(
            "foodTypeList"
        );

    container.innerHTML = "";

    const icons = {

        veg: "🟢",

        non_veg: "🔴",

        egg: "🥚",

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
class="${
selectedFoodType === type.id
? "text-blue-600 transition hover:bg-blue-200 hover:text-blue-700"
: "border bg-white"
} flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium">

${type.name}

</button>

`;

    });

}
async function cancelItem(ticketItemId) {

    Modal.confirm(

    "Cancel Item",

    "Are you sure you want to cancel this item?",

    async () => {

        const data =
            await API.patch(
                `/api/kitchen/items/${ticketItemId}/cancel`
            );

        if (!data.success) {

            Toast.show(
                data.message,
                "error"
            );

            return;

        }

        Toast.show(
            "Item cancelled",
            "success"
        );

        await loadCurrentOrder();

        Modal.close();

    },

    {

        buttonText: "Cancel Item",

        buttonClass: "bg-red-600"

    }

);

}
async function serveItem(ticketItemId) {

    Modal.confirm(

        "Serve Item",

        "Mark this item as served?",

        async () => {

            const data =
                await API.patch(
                    `/api/kitchen/items/${ticketItemId}/status`,
                    {
                        status: "served"
                    }
                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Item Served",
                "success"
            );

            await loadCurrentOrder();

        },

        {

            buttonText: "Serve",

            buttonClass: "bg-green-600",

            loadingText: "Serving..."

        }

    );

}
async function sendToBilling(
    orderId
) {

    const button =
        document.getElementById(
            "sendBillingBtn"
        );

    if (button) {

        button.disabled = true;

        button.textContent =
            "Processing...";

    }

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

        if (data.alreadyProcessed) {

            await loadCurrentOrder();

            return;

        }

        Toast.show(
            "Sent To Billing",
            "success"
        );

        await loadCurrentOrder();

    }

    catch (err) {

        Toast.show(
            err.message,
            "error"
        );

    }

    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Send To Billing";

        }

    }

}
async function closeCancelledOrder(
    orderId
) {

    const data =
        await API.patch(
            `/api/kitchen/${orderId}/close-cancelled`
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

setTimeout(() => {

    window.location.reload();

}, 500);

}
function selectFoodType(foodType) {

    selectedFoodType = foodType;

    renderFoodTypes();

    applyFilters();

}