let staff = [];
let editingStaffId = null;
if (!API.getToken()) {

    window.location.href =
        "/admin/login.html";

}

async function loadStaff() {

    const data =
        await API.get("/api/staff");

    const list =
        document.getElementById(
            "staffList"
        );

    list.innerHTML = "";

    if (!data.success) {

        list.innerHTML = `
<p class="text-red-600">

Unable to load staff.

</p>
`;

        return;

    }

    staff = data.staff;

    renderStaff(staff);

}

function renderStaff(rows) {

    const list =
        document.getElementById(
            "staffList"
        );

    list.innerHTML = "";

    if (rows.length === 0) {

        list.innerHTML = `

<div
    class="rounded-xl bg-white p-10 text-center shadow">

    <h2
        class="text-xl font-semibold">

        No Staff Added

    </h2>

    <p
        class="mt-2 text-slate-500">

        Click "Add Staff" to create your first employee.

    </p>

</div>

`;

        return;

    }

    rows.forEach(item => {

        list.innerHTML += `

<div
    class="rounded-xl bg-white p-5 shadow">

    <div
        class="flex items-center justify-between">

        <div>

            <h2
                class="text-xl font-bold">

                ${item.name}

            </h2>

            <p
                class="mt-1 text-slate-500">

                ${item.staff_code}

            </p>

            <p
                class="mt-2">

                👤 ${item.role}

            </p>

            <p>

                📱 ${item.mobile || "-"}

            </p>

            <p>

🔑 ${item.username || "-"}

</p>

            <p>

                ${Align.formatCurrency(item.basic_salary)}

                /

                ${item.salary_type}

            </p>

        </div>

       <div class="flex flex-col items-end gap-3">

    <span
        class="rounded-full px-3 py-1 text-sm font-medium
        ${item.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"}">

        ${item.status}

    </span>

    <div class="flex gap-2">

        <button
            class="edit-staff rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"

            data-id="${item.id}"

            data-name="${encodeURIComponent(item.name)}"

            data-mobile="${item.mobile || ""}"

            data-role="${encodeURIComponent(item.role)}"

            data-username="${item.username || ""}"

            data-salarytype="${item.salary_type}"

            data-salary="${item.basic_salary}"

            data-joining="${item.joining_date || ""}"

            data-address="${encodeURIComponent(item.address || "")}"

            data-emergency="${item.emergency_contact || ""}"

            data-status="${item.status}">

            Edit

        </button>

        <button
            class="delete-staff rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"

            data-id="${item.id}"

            data-name="${encodeURIComponent(item.name)}">

            Delete

        </button>

    </div>

</div>

        </div>

    </div>

</div>

`;

    });

}
function openStaffModal(staff = null) {
 if (staff instanceof Event) {

        staff = null;

    }
    Modal.open(

        staff
            ? "Edit Staff"
            : "Add Staff",

        `
<div class="grid grid-cols-2 gap-4">

    <div id="nameGroup">

    <label class="mb-2 block font-medium">
        Name
    </label>

        <input
            id="staffName"
            value="${staff?.name || ""}"
            class="w-full rounded-lg border p-3">

    </div>

    <div id="mobileGroup">

    <label class="mb-2 block font-medium">
        Mobile
    </label>

        <input
            id="staffMobile"
            value="${staff?.mobile || ""}"
            class="w-full rounded-lg border p-3">

    </div>

    <div>

        <label class="mb-2 block font-medium">
            Username
        </label>

        <input
            id="staffUsername"
            value="${staff?.username || ""}"
            placeholder=""
            class="w-full rounded-lg border p-3">

    </div>

    <div>

        <label class="mb-2 block font-medium">
            Role
        </label>

        <select
            id="staffRole"
            class="w-full rounded-lg border p-3">

            <option value="manager" ${staff?.role==="manager"?"selected":""}>Manager</option>

            <option value="waiter" ${staff?.role==="waiter"?"selected":""}>Waiter</option>

            <option value="device" ${staff?.role==="device"?"selected":""}>📱 Device</option>

            <option value="kitchen" ${staff?.role==="kitchen"?"selected":""}>Kitchen</option>

            <option value="cashier" ${staff?.role==="cashier"?"selected":""}>Cashier</option>
        </select>

    </div>

   ${!staff ? `

<div id="passwordGroup">

        <label class="mb-2 block font-medium">
            Password
        </label>

        <input
            id="staffPassword"
            type="password"
            placeholder="Minimum 8 characters"
            class="w-full rounded-lg border p-3">

    </div>

    ` : `<div></div>`}

    <div id="salaryTypeGroup">

    <label class="mb-2 block font-medium">
        Salary Type
    </label>

        <select
            id="salaryType"
            class="w-full rounded-lg border p-3">

            <option value="monthly" ${staff?.salary_type==="monthly"?"selected":""}>
                Monthly
            </option>

            <option value="daily" ${staff?.salary_type==="daily"?"selected":""}>
                Daily
            </option>

        </select>

    </div>

   <div id="salaryGroup">

    <label class="mb-2 block font-medium">
        Basic Salary
    </label>

        <input
            id="basicSalary"
            type="number"
            value="${staff?.basic_salary || 0}"
            class="w-full rounded-lg border p-3">

    </div>

   <div id="joiningGroup">

    <label class="mb-2 block font-medium">
        Joining Date
    </label>

        <input
            id="joiningDate"
            type="date"
            value="${staff?.joining_date || ""}"
            class="w-full rounded-lg border p-3">

    </div>

    <div
    id="addressGroup"
    class="col-span-2">

        <label class="mb-2 block font-medium">
            Address
        </label>

        <textarea
            id="staffAddress"
            class="w-full rounded-lg border p-3">${staff?.address || ""}</textarea>

    </div>

    <div id="emergencyGroup">

    <label class="mb-2 block font-medium">
        Emergency Contact
    </label>

        <input
            id="emergencyContact"
            value="${staff?.emergency_contact || ""}"
            class="w-full rounded-lg border p-3">

    </div>

    <div>

        <label class="mb-2 block font-medium">
            Status
        </label>

        <select
            id="staffStatus"
            class="w-full rounded-lg border p-3">

            <option value="active" ${staff?.status==="active"?"selected":""}>
                Active
            </option>

            <option value="inactive" ${staff?.status==="inactive"?"selected":""}>
                Inactive
            </option>

        </select>

    </div>

</div>
`,

        saveStaff

    );
    const roleSelect =

    document.getElementById(

        "staffRole"

    );

roleSelect.addEventListener(

    "change",

    toggleStaffFields

);

toggleStaffFields();

}
function toggleStaffFields() {

    const isDevice =
        document.getElementById(
            "staffRole"
        ).value === "device";

    [

        "mobileGroup",
        "salaryTypeGroup",
        "salaryGroup",
        "joiningGroup",
        "addressGroup",
        "emergencyGroup"

    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) {

            el.style.display =
                isDevice
                    ? "none"
                    : "";

        }

    });

}
async function saveStaff() {
    
   const usernameInput =
    document.getElementById("staffUsername");

const passwordInput =
    document.getElementById("staffPassword");

const role =
    document.getElementById("staffRole").value.trim();

const isDevice =
    role === "device";

const body = {

    name:
        document.getElementById("staffName").value.trim(),

    mobile:
        isDevice
            ? ""
            : document.getElementById("staffMobile").value.trim(),

    role:
        role,

    username:
        usernameInput.value.trim().toLowerCase(),

    password:
        passwordInput
            ? passwordInput.value
            : undefined,

    salary_type:
        isDevice
            ? null
            : document.getElementById("salaryType").value,

    basic_salary:
        isDevice
            ? 0
            : Number(document.getElementById("basicSalary").value),

    joining_date:
        isDevice
            ? null
            : document.getElementById("joiningDate").value,

    address:
        isDevice
            ? ""
            : document.getElementById("staffAddress").value.trim(),

    emergency_contact:
        isDevice
            ? ""
            : document.getElementById("emergencyContact").value.trim(),

    status:
        document.getElementById("staffStatus").value

    };

    if (!body.name) {

        Toast.show(
            "Staff name is required",
            "error"
        );

        return;

    }

    if (!body.role) {

        Toast.show(
            "Role is required",
            "error"
        );

        return;

    }
    if (!body.username) {

    Toast.show(

        "Username is required",

        "error"

    );

    return;

}

if (

!editingStaffId &&

!body.password

) {

    Toast.show(

        "Password is required",

        "error"

    );

    return;

}

    let data;

    const isEdit =
        !!editingStaffId;

    if (isEdit) {

        data = await API.put(

            `/api/staff/${editingStaffId}`,

            body

        );

    } else {

        data = await API.post(

            "/api/staff",

            body

        );

    }

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    editingStaffId = null;

    Modal.close();

    Toast.show(

        isEdit

            ? "Staff updated successfully"

            : "Staff created successfully"

    );

    await loadStaff();

}

document
    .getElementById("addStaffBtn")
    .onclick = () => openStaffModal(null);
const addStaffBtnMobile =
    document.getElementById(
        "addStaffBtnMobile"
    );

if (addStaffBtnMobile) {

    addStaffBtnMobile.onclick = () =>
        openStaffModal(null);

}    

loadStaff();

document.addEventListener("click", e => {

    const editBtn =
        e.target.closest(".edit-staff");

    if (editBtn) {

        editingStaffId =
            Number(editBtn.dataset.id);

        openStaffModal({

            

            name:
                decodeURIComponent(
                    editBtn.dataset.name
                ),

            mobile:
                editBtn.dataset.mobile,

            role:
                decodeURIComponent(
                    editBtn.dataset.role
                ),
            username:
    editBtn.dataset.username,    

            salary_type:
                editBtn.dataset.salarytype,

            basic_salary:
                Number(
                    editBtn.dataset.salary
                ),

            joining_date:
                editBtn.dataset.joining,

            address:
                decodeURIComponent(
                    editBtn.dataset.address
                ),

            emergency_contact:
                editBtn.dataset.emergency,

            status:
                editBtn.dataset.status

        });
        

        return;

    }

    const deleteBtn =
        e.target.closest(".delete-staff");

    if (deleteBtn) {

        deleteStaff(

            Number(deleteBtn.dataset.id),

            decodeURIComponent(
                deleteBtn.dataset.name
            )

        );

    }

});

async function deleteStaff(
    id,
    name
) {

    Modal.confirm(

        "Delete Staff",

        `Are you sure you want to delete "${name}"?`,

        async () => {

            const data =
                await API.delete(
                    `/api/staff/${id}`
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
                "Staff deleted successfully"
            );

            await loadStaff();

        }

    );

}