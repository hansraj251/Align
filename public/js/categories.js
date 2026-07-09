let editingCategoryId = null;
let allCategories = [];
const token = localStorage.getItem("token");
if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}
const isEdit = !!editingCategoryId;

async function loadCategories() {

    const data = await API.get("/api/menu/categories");

    const list = document.getElementById("categoryList");

    if (!data.success) {

    list.innerHTML = "<p>Unable to load categories.</p>";

    return;

}

allCategories = data.categories;

renderCategories(allCategories);

}
function renderCategories(categories) {

    const list =
        document.getElementById("categoryList");

    list.innerHTML = "";

    categories.forEach(category => {

        list.innerHTML += `

<div class="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">

    <h3 class="text-lg font-bold">

        ${category.name}

    </h3>

    <p class="mt-2 min-h-[40px] text-sm text-slate-500">

        ${category.description || "No description"}

    </p>

    <div class="mt-5 flex gap-2">

        <button
            class="edit-category flex-1 rounded-lg bg-amber-500 py-2 text-white transition hover:bg-amber-600"
            data-id="${category.id}"
            data-name="${encodeURIComponent(category.name)}"
            data-description="${encodeURIComponent(category.description || "")}">

            Edit

        </button>

        <button
            class="delete-category flex-1 rounded-lg bg-red-600 py-2 text-white transition hover:bg-red-700"
            data-id="${category.id}"
            data-name="${encodeURIComponent(category.name)}">

            Delete

        </button>

    </div>

</div>

`;

    });

}

async function saveCategory() {

    const name = document.getElementById("categoryName").value.trim();

    const description =
        document.getElementById("categoryDescription").value.trim();

    if (!name) {

        Modal.open(

            "Validation",

            `

<p class="text-slate-600">

Category name is required.

</p>

`,

            () => {

                Modal.close();

                document

                    .getElementById("categoryName")

                    .focus();

            },

            {

                buttonText: "OK",

                buttonClass: "bg-blue-600"

            }

        );

        return;
    }

    let data;

if (editingCategoryId) {

    data = await API.put(
        `/api/menu/categories/${editingCategoryId}`,
        {
            name,
            description
        }
    );

} else {

    data = await API.post(
        "/api/menu/categories",
        {
            name,
            description
        }
    );

}

    if (!data.success) {
        Toast.show(data.message, "error");
        return;
    }

    document.getElementById("categoryName").value = "";
    document.getElementById("categoryDescription").value = "";

    await loadCategories();
    Toast.show("Category created successfully");
    editingCategoryId = null;

document.getElementById("categoryId").value = "";

document.getElementById("saveCategoryBtn").textContent =
    "Add Category";

document.getElementById("cancelEditBtn")
    .classList.add("hidden");

}

document
    .getElementById("saveCategoryBtn")
    .addEventListener("click", saveCategory);

loadCategories();

document.addEventListener("click", async (e) => {

    const editBtn =
        e.target.closest(".edit-category");

    if (editBtn) {

        editCategory(

            Number(editBtn.dataset.id),

            decodeURIComponent(editBtn.dataset.name),

            decodeURIComponent(editBtn.dataset.description)

        );

        return;

    }

    const deleteBtn =
        e.target.closest(".delete-category");

    if (deleteBtn) {

        deleteCategory(

            Number(deleteBtn.dataset.id),

            decodeURIComponent(deleteBtn.dataset.name)

        );

    }

});

function deleteCategory(id, name) {

    Modal.confirm(

        "Delete Category",

        `Are you sure you want to delete "${name}"?`,

        async () => {

            const data =
                await API.delete(
                    `/api/menu/categories/${id}`
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
                "Category deleted successfully"
            );

            loadCategories();

        }

    );

}
function editCategory(
    id,
    name,
    description
) {

    editingCategoryId = id;

    document.getElementById("categoryId").value =
        id;

    document.getElementById("categoryName").value =
        name;

    document.getElementById("categoryDescription").value =
        description;

    document.getElementById("saveCategoryBtn").textContent =
        "Update Category";

    document.getElementById("cancelEditBtn")
        .classList.remove("hidden");

}
function cancelEdit() {

    editingCategoryId = null;

    document.getElementById("categoryId").value = "";

    document.getElementById("categoryName").value = "";

    document.getElementById("categoryDescription").value = "";

    document.getElementById("saveCategoryBtn").textContent =
        "Add Category";

    document.getElementById("cancelEditBtn")
        .classList.add("hidden");

}
document
    .getElementById("cancelEditBtn")
    .addEventListener(
        "click",
        cancelEdit
    );

document
    .getElementById("categorySearch")
    .addEventListener(
        "input",
        e => {

            const search =
                e.target.value
                    .toLowerCase()
                    .trim();

            const filtered =
                allCategories.filter(category =>
                    category.name
                        .toLowerCase()
                        .includes(search)
                );

            renderCategories(
                filtered
            );

        }
    );    