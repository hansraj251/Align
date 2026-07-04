StaffAuth.requireLogin();

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
console.count("initialize");
document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        initialize
    );

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

document
    .getElementById("checkoutBtn")
    .addEventListener(
        "click",
        sendToKitchen
    );    
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
    document.getElementById("sendKitchenBtn");

const cartButton =
    document.getElementById("checkoutBtn");

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
? "bg-blue-600 text-white"
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
? "bg-blue-600 text-white"
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
function renderMenu(items) {

    const menu =
        document.getElementById(
            "menuList"
        );

    menu.innerHTML = "";

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

    menu.innerHTML += `

<div class="rounded-xl bg-white p-4 shadow">

<div class="flex items-center justify-between">

<div>

<h3 class="text-sm font-semibold">

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
        <p class="mt-1 text-base font-bold text-blue-600">

           ${Align.formatCurrency(item.price)}

        </p>
        `
}

</div>

${
!hasVariants
? `
<button

onclick="addItem(
${item.id},
'${item.name.replace(/'/g,"\\'")}',
${item.price}
)"

class="rounded-lg bg-blue-600 px-4 py-2 text-white">

+

</button>
`
: ""
}

</div>

${
hasVariants
? item.variants.map(v => `

<div class="mt-3 flex items-center justify-between rounded-lg border p-2">

<div>

${v.name}

<span class="ml-2 text-slate-500">

${Align.formatCurrency(v.price)}

</span>

</div>

<button

onclick="addItem(
${item.id},
'${item.name.replace(/'/g,"\\'")}',
${v.price},
${v.id},
'${v.name.replace(/'/g,"\\'")}'
)"

class="rounded-lg bg-blue-600 px-3 py-1 text-white">

+

</button>

</div>

`).join("")
: ""
}

</div>

`;

});

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

    const container =
        document.getElementById(
            "cartItemsList"
        );

    container.innerHTML = "";

    if (
        !Align.Order.state.cart.length
    ) {

        container.innerHTML = `

<div class="rounded-xl border border-dashed p-6 text-center text-slate-500">

Cart is empty

</div>

`;

    }

    Align.Order.state.cart.forEach(item => {

        container.innerHTML += `

<div class="rounded-xl border p-4">

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

${Align.formatCurrency(item.unit_price)}

</div>

</div>

<div class="mt-4 flex items-center justify-between">

<button

onclick="decreaseQty(

${item.menu_item_id},

${item.variant_id ?? "null"}

)"

class="rounded-lg bg-slate-200 px-3 py-1">

−

</button>

<strong>

${item.quantity}

</strong>

<button

onclick="increaseQty(

${item.menu_item_id},

${item.variant_id ?? "null"}

)"

class="rounded-lg bg-blue-600 px-3 py-1 text-white">

+

</button>

</div>

</div>

`;

    });

    document.getElementById(
    "cartTotal"
).textContent =
    Align.formatCurrency(
        Align.Order.cart.total(),
        2
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

    if (typeof updateCartSummary === "function") {

    updateCartSummary();

}

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

    if (typeof updateCartSummary === "function") {

    updateCartSummary();

}

    renderCart();

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

<h2 class="mb-3 text-lg font-bold">

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

</div>

</div>

`).join("")}

`;

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
? "bg-blue-600 text-white"
: "border bg-white"
} flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium">

${type.name}

</button>

`;

    });

}
function selectFoodType(foodType) {

    selectedFoodType = foodType;

    renderFoodTypes();

    applyFilters();

}