if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}

const params = new URLSearchParams(window.location.search);

const tableId = params.get("table");

let cart =

    JSON.parse(

        sessionStorage.getItem("cart")

    ) || [];

async function loadMenu() {

    const data = await API.get("/api/menu/items");

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

loadMenu();
renderCart();
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

    if (cart.length === 0) {

        cartDiv.innerHTML = "No Items";

        document.getElementById("total").textContent = "₹0";

        return;

    }

    let total = 0;

    cartDiv.innerHTML = "";

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
    "cart",
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