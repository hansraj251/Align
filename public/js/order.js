let allMenuItems = [];

let filteredMenuItems = [];

let selectedCategory = "all";

let selectedFoodType = "all";
let selectedVariants = {};
if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}

const params =
    new URLSearchParams(
        window.location.search
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
        await API.get("/api/menu/items");

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
            item.variants.map(v => `

<button

onclick="selectVariant(${item.id},${v.id})"

class="variant-chip rounded-full border px-3 py-1 text-sm ${
    selectedVariants[item.id] === v.id
        ? "bg-blue-600 text-white"
        : ""
}"

>

${v.name}

₹${v.price}

</button>

`).join("");

        menu.innerHTML += `

<div class="rounded-xl border bg-white p-4">

<div class="flex items-start justify-between">

<div>

<h3 class="font-semibold">

${item.name}

</h3>

<p class="mt-1 text-sm text-slate-500">

${item.category}

</p>

</div>

<button

onclick="addSelectedVariant(${item.id})"

class="rounded-lg bg-blue-600 px-4 py-2 text-white">

+

</button>

</div>

<div

class="mt-3 flex flex-wrap gap-2">

${variantsHtml}

</div>

</div>

`;

    });

}
function selectVariant(
    menuItemId,
    variantId
) {

    selectedVariants[
        menuItemId
    ] = variantId;

    renderMenu(
        filteredMenuItems
    );

}
function addSelectedVariant(menuItemId) {

    const item =
        allMenuItems.find(
            i => i.id === menuItemId
        );

    if (!item) {
        return;
    }

    // No variants
    if (
        !item.variants ||
        item.variants.length === 0
    ) {

        addItem(
            item.id,
            item.name,
            item.price
        );

        return;
    }

    let variant =
        item.variants.find(
            v =>
                v.id ===
                selectedVariants[menuItemId]
        );

    if (!variant) {
        variant = item.variants[0];
    }

    addItem(
        item.id,
        item.name,
        variant?.price || menu.price,
        variant?.id || null,
        variant?.name || null
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

    existingItems = order.items.map(item => ({

    id: item.menu_item_id,

    name: item.name,

    variant_name: item.variant_name,

    price: item.unit_price,

    quantity: item.quantity

}));

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

    document.getElementById("total").textContent = "₹0";

    return;

}

    let total = 0;

    cartDiv.innerHTML = "";
    if (existingItems.length > 0) {

    cartDiv.innerHTML += `
        <h3 class="mb-3 text-lg font-bold">

            Current Order

        </h3>
    `;

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

${item.variant_name}

</small>

            </h4>

            <p class="text-sm text-slate-500">

                Qty : ${item.quantity}

            </p>

        </div>

        <strong>

            ₹${total}

        </strong>

    </div>

</div>
`;

    });

    cartDiv.innerHTML += `
        <hr class="my-4">
        <h3 class="mb-3 text-lg font-bold">

            New Items

        </h3>
    `;

}

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

                ₹${item.unit_price} each

            </p>

        </div>

        <strong>

            ₹${itemTotal}

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

    });

    document.getElementById("total").textContent =
    `₹${Align.Order.cart.total()}`;
        sessionStorage.setItem(
    cartKey,
    JSON.stringify(cart)
);

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

class="category-chip rounded-full border px-4 py-2"

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
"category-chip rounded-full bg-blue-600 px-4 py-2 text-white";

            } else {

                btn.className =
"category-chip rounded-full border px-4 py-2";

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

        jain: "🟡"

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

class="food-chip rounded-full border px-4 py-2"

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
"food-chip rounded-full bg-blue-600 px-4 py-2 text-white";

            }

            else {

                btn.className =
"food-chip rounded-full border px-4 py-2";

            }

        });

}
document
.getElementById("menuSearch")
.addEventListener(

"input",

applyFilters

);