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

let cart =
    JSON.parse(
        sessionStorage.getItem(cartKey)
    ) || [];
let existingItems = [];    

async function loadMenu() {

    const data = await API.get("/api/menu/items");
    if (data.success) {

    data.items = data.items.filter(
        item => item.is_available == 1
    );

}

    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    const menu = document.getElementById("menuList");

    menu.innerHTML = "";

    data.items.forEach(item => {

        menu.innerHTML += `
            <div class="mb-3 flex items-center justify-between rounded-lg border p-4">

                <div>

                    <h3 class="font-semibold">
                        ${item.name}
                    </h3>

                    <p class="text-sm text-slate-500">

                        ₹${item.price}

                    </p>

                </div>

                <button
                    onclick="addItem(
                        ${item.id},
                        '${item.name}',
                        ${item.price}
                    )"
                    class="rounded bg-blue-600 px-4 py-2 text-white">

                    +

                </button>

            </div>
        `;

    });

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

    price: item.unit_price,

    quantity: item.quantity

}));

renderCart();

}
function addItem(id, name, price) {

    const existing = cart.find(item => item.id === id);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            id,
            name,
            price,
            quantity: 1
        });

    }

    renderCart();

}

function renderCart() {

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

        const itemTotal = item.quantity * item.price;

        total += itemTotal;

        cartDiv.innerHTML += `
<div class="mb-3 rounded-lg border p-3">

    <div class="flex items-center justify-between">

        <div>

            <h4 class="font-semibold">

                ${item.name}

            </h4>

            <p class="text-sm text-slate-500">

                ₹${item.price} each

            </p>

        </div>

        <strong>

            ₹${itemTotal}

        </strong>

    </div>

    <div class="mt-3 flex items-center gap-3">

        <button
            onclick="decreaseQty(${item.id})"
            class="h-9 w-9 rounded bg-red-500 text-white">

            -

        </button>

        <span class="text-lg font-semibold">

            ${item.quantity}

        </span>

        <button
            onclick="increaseQty(${item.id})"
            class="h-9 w-9 rounded bg-green-600 text-white">

            +

        </button>

    </div>

</div>
`;

    });

    document.getElementById("total").textContent =
        `₹${total}`;
        sessionStorage.setItem(
    cartKey,
    JSON.stringify(cart)
);

}
function increaseQty(id) {

    const item = cart.find(i => i.id === id);

    if (!item) return;

    item.quantity++;

    renderCart();

}

function decreaseQty(id) {

    const index = cart.findIndex(i => i.id === id);

    if (index === -1) return;

    cart[index].quantity--;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }

    renderCart();

}
async function sendToKitchen() {

    if (cart.length === 0) {

        Toast.show("Cart is empty", "error");

        return;

    }

    const button =
        document.getElementById("sendKitchenBtn");

    button.disabled = true;

    button.textContent = "Sending...";

    const payload = {

        table_id: Number(tableId),

        items: cart.map(item => ({

            menu_item_id: item.id,

            quantity: item.quantity

        }))

    };

    const data =
        await API.post(
            "/api/orders/checkout",
            payload
        );

    if (!data.success) {

        Toast.show(data.message, "error");

        button.disabled = false;

        button.textContent =
            "Send To Kitchen";

        return;

    }

    sessionStorage.removeItem(cartKey);

    Toast.show("Order sent successfully");

    setTimeout(() => {

    window.location.href =
        "/admin/dashboard.html";

}, 800);

}