let quickItems = [];
async function loadQuickItemsModal() {

    await loadComponent(

        "quickItemsModalContainer",

        "/components/quickItemsModal.html"

    );

    bindQuickItemsModalEvents();

}

function bindQuickItemsModalEvents() {

    document
        .getElementById(
            "closeQuickItemsModal"
        )
        .addEventListener(
            "click",
            closeQuickItemsModal
        );

}

async function openQuickItemsModal() {

    await loadQuickItems();

const search =
    document.getElementById(
        "quickItemSearch"
    );

if (search) {

    search.value = "";

}

    const modal =
        document.getElementById(
            "quickItemsModal"
        );

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );

}

function closeQuickItemsModal() {

    document
        .getElementById(
            "quickItemsModal"
        )
        .classList.remove(
            "flex"
        );

    document
        .getElementById(
            "quickItemsModal"
        )
        .classList.add(
            "hidden"
        );

}
async function loadQuickItems() {

    const response =
        await API.get(
            "/api/quick-items"
        );

    if (!response.success) {

        Toast.show(
            response.message,
            "error"
        );

        return;

    }

    quickItems =
        response.data.filter(
            item => item.active
        );

    renderQuickItems();

}
function renderQuickItems(
    items = quickItems
) {

    const container =
        document.getElementById(
            "quickItemsList"
        );

    if (!items.length) {

        container.innerHTML =
            `
            <p class="text-center text-slate-500">
                No quick items available
            </p>
            `;

        return;

    }

    container.innerHTML =
    items.map(
            item => `
                <div
                    class="flex items-center justify-between rounded-lg border p-3">

                    <div>

                        <div class="font-medium">
                            ${item.name}
                        </div>

                        <div class="text-sm text-slate-500">
                            ${Align.formatCurrency(item.price)}
                        </div>

                    </div>

                    <button
                        class="add-quick-item rounded-lg bg-slate-600 px-3 py-2 text-white"
                        data-id="${item.id}">

                        Add

                    </button>

                </div>
            `
        ).join("");
        bindQuickItemEvents();
        

}

function bindQuickItemEvents() {

    document
        .querySelectorAll(".add-quick-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    const item =
                        quickItems.find(
                            quickItem =>
                                quickItem.id === id
                        );

                    if (!item) {

                        return;

                    }

                    Align.Order.cart.add({

                        quick_item_id: item.id,

                        is_quick_item: 1,

                        item_name: item.name,

                        unit_price: item.price

                    });

                    renderCart();

                    closeQuickItemsModal();

                }
            );

        });
document
    .getElementById(
        "quickItemSearch"
    )
    ?.addEventListener(
        "input",
        event => {

            const keyword =
                event.target.value
                    .trim()
                    .toLowerCase();

            const filtered =
                quickItems.filter(
                    item =>
                        [
    item.name
]
.join(" ")
.toLowerCase()
.includes(keyword)
                );

            renderQuickItems(
                filtered
            );

        }
    );
}