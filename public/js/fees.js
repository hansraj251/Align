Auth.requireSchoolOwner();
function getCurrentAcademicYear() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        today.getMonth() + 1;

    const startYear =
        month >= 4
            ? year
            : year - 1;

    return `${startYear}-${String(
        startYear + 1
    ).slice(-2)}`;

}
const feesStudentTableBody =
    document.getElementById(
        "feesStudentTableBody"
    );

const feesManagementPanel =
    document.getElementById(
        "feesManagementPanel"
    );

const feesStudentName =
    document.getElementById(
        "feesStudentName"
    );

const feesStudentDetails =
    document.getElementById(
        "feesStudentDetails"
    );

const managementTotalFee =
    document.getElementById(
        "managementTotalFee"
    );

const managementTotalPaid =
    document.getElementById(
        "managementTotalPaid"
    );

const managementBalance =
    document.getElementById(
        "managementBalance"
    );

const closeFeesPanelBtn =
    document.getElementById(
        "closeFeesPanelBtn"
    );
const addFeeStructureBtn =
    document.getElementById(
        "addFeeStructureBtn"
    );

const recordPaymentBtn =
    document.getElementById(
        "recordPaymentBtn"
    );
const paymentForm =
    document.getElementById(
        "paymentForm"
    );

const paymentAmountInput =
    document.getElementById(
        "paymentAmount"
    );

const paymentDateInput =
    document.getElementById(
        "paymentDate"
    );

const paymentModeInput =
    document.getElementById(
        "paymentMode"
    );

const paymentReceiptNoInput =
    document.getElementById(
        "paymentReceiptNo"
    );

const paymentRemarksInput =
    document.getElementById(
        "paymentRemarks"
    );

const savePaymentBtn =
    document.getElementById(
        "savePaymentBtn"
    );

const cancelPaymentBtn =
    document.getElementById(
        "cancelPaymentBtn"
    );

const paymentFormResult =
    document.getElementById(
        "paymentFormResult"
    );

const feeStructuresBody =
    document.getElementById(
        "feeStructuresBody"
    );

const feePaymentsBody =
    document.getElementById(
        "feePaymentsBody"
    );
const feeStructureForm =
    document.getElementById(
        "feeStructureForm"
    );

const feeHeadInput =
    document.getElementById(
        "feeHead"
    );

const feeAmountInput =
    document.getElementById(
        "feeAmount"
    );

const feeEffectiveFromInput =
    document.getElementById(
        "feeEffectiveFrom"
    );

const saveFeeStructureBtn =
    document.getElementById(
        "saveFeeStructureBtn"
    );

const cancelFeeStructureBtn =
    document.getElementById(
        "cancelFeeStructureBtn"
    );

const feeStructureFormResult =
    document.getElementById(
        "feeStructureFormResult"
    );

closeFeesPanelBtn.addEventListener(
    "click",
    closeFeesPanel
);
addFeeStructureBtn.addEventListener(
    "click",
    openFeeStructureForm
);

cancelFeeStructureBtn.addEventListener(
    "click",
    closeFeeStructureForm
);
saveFeeStructureBtn.addEventListener(
    "click",
    saveFeeStructure
);
recordPaymentBtn.addEventListener(
    "click",
    openPaymentForm
);

cancelPaymentBtn.addEventListener(
    "click",
    closePaymentForm
);

savePaymentBtn.addEventListener(
    "click",
    savePayment
);

function openFeeStructureForm() {

    feeStructureFormResult.textContent =
        "";

    feeStructureFormResult.className =
        "text-sm";

    feeHeadInput.value =
        "";

    feeAmountInput.value =
        "";

    feeEffectiveFromInput.value =
        "";

    feeStructureForm.classList.remove(
        "hidden"
    );

    feeHeadInput.focus();

}

function closeFeeStructureForm() {

    feeStructureForm.classList.add(
        "hidden"
    );

}
function openPaymentForm() {

    paymentFormResult.textContent =
        "";

    paymentFormResult.className =
        "text-sm";

    paymentAmountInput.value =
        "";
    paymentAmountInput.max =
    Number(
        feesManagementPanel.dataset.balance ||
        0
    );

    paymentDateInput.value =
        new Date()
            .toISOString()
            .split("T")[0];

    paymentModeInput.value =
        "";

    paymentReceiptNoInput.value =
        "";

    paymentRemarksInput.value =
        "";

    paymentForm.classList.remove(
        "hidden"
    );

    paymentAmountInput.focus();

}
paymentAmountInput.addEventListener(
    "input",
    () => {

        const balance =
            Number(
                feesManagementPanel.dataset.balance ||
                0
            );

        const amount =
            Number(
                paymentAmountInput.value
            );

        if (
            Number.isFinite(amount) &&
            amount > balance
        ) {

            paymentFormResult.textContent =
                `Maximum payable amount is ${formatCurrency(balance)}`;

            paymentFormResult.className =
                "text-sm text-red-600";

        }
        else {

            paymentFormResult.textContent =
                "";

            paymentFormResult.className =
                "text-sm";

        }

    }
);
function closePaymentForm() {

    paymentForm.classList.add(
        "hidden"
    );

    paymentFormResult.textContent =
        "";

    paymentFormResult.className =
        "text-sm";

}
async function savePayment() {

    try {

        paymentFormResult.textContent =
            "";

        paymentFormResult.className =
            "text-sm";

        const studentId =
            feesManagementPanel.dataset.studentId;

        const academicYear =
            getCurrentAcademicYear();

        const amount =
            Number(
                paymentAmountInput.value
            );

        const paymentDate =
            paymentDateInput.value;

        const paymentMode =
            paymentModeInput.value;

        const receiptNo =
            paymentReceiptNoInput.value.trim();

        const remarks =
            paymentRemarksInput.value.trim();

        if (
            !studentId
        ) {

            throw new Error(
                "Student not selected"
            );

        }

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            throw new Error(
                "Enter a valid payment amount"
            );

        }

        if (
            !paymentDate
        ) {

            throw new Error(
                "Payment date is required"
            );

        }

        if (
            !paymentMode
        ) {

            throw new Error(
                "Payment mode is required"
            );

        }

        savePaymentBtn.disabled =
            true;

        savePaymentBtn.textContent =
            "Saving...";

        const response =
            await API.post(
                "/api/fee-payments",
                {

                    studentId:
                        Number(
                            studentId
                        ),

                    academicYear,

                    amount,

                    paymentDate,

                    paymentMode,

                    receiptNo:
                        receiptNo ||
                        null,

                    remarks:
                        remarks ||
                        null

                }
            );

        if (
            !response.success
        ) {

            throw new Error(
                response.message ||
                "Unable to record payment"
            );

        }

        paymentFormResult.textContent =
            "Payment recorded successfully.";

        paymentFormResult.className =
            "text-sm text-emerald-600";

        closePaymentForm();

        await openFees(
            Number(
                studentId
            )
        );

    }
    catch (err) {

        console.error(err);

        paymentFormResult.textContent =
            err.message ||
            "Unable to record payment.";

        paymentFormResult.className =
            "text-sm text-red-600";

    }
    finally {

        savePaymentBtn.disabled =
            false;

        savePaymentBtn.textContent =
            "Save Payment";

    }

}
async function saveFeeStructure() {

    try {

        feeStructureFormResult.textContent =
            "";

        feeStructureFormResult.className =
            "text-sm";

        const feeHead =
            feeHeadInput.value.trim();

        const amount =
            Number(
                feeAmountInput.value
            );

        const effectiveFrom =
            feeEffectiveFromInput.value;

        if (
            !feeHead
        ) {

            throw new Error(
                "Fee head is required"
            );

        }

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            throw new Error(
                "Enter a valid fee amount"
            );

        }

        if (
            !effectiveFrom
        ) {

            throw new Error(
                "Effective date is required"
            );

        }

        const studentId =
            feesManagementPanel.dataset.studentId;

        const academicYear =
            getCurrentAcademicYear();

        if (
            !studentId
        ) {

            throw new Error(
                "Student not selected"
            );

        }

        saveFeeStructureBtn.disabled =
            true;

        saveFeeStructureBtn.textContent =
            "Saving...";


        const response =
            await API.post(
                "/api/fee-structures",
                {

                    studentId:
                        Number(
                            studentId
                        ),

                    academicYear,

                    feeHead,

                    amount,

                    effectiveFrom

                }
            );

        if (
            !response.success
        ) {

            throw new Error(
                response.message ||
                "Unable to save fee structure"
            );

        }

        feeStructureFormResult.textContent =
            "Fee structure saved successfully.";

        feeStructureFormResult.className =
            "text-sm text-emerald-600";

        closeFeeStructureForm();

        await openFees(
            Number(
                studentId
            )
        );

    }
    catch (err) {

        console.error(err);

        feeStructureFormResult.textContent =
            err.message ||
            "Unable to save fee structure.";

        feeStructureFormResult.className =
            "text-sm text-red-600";

    }
    finally {

        saveFeeStructureBtn.disabled =
            false;

        saveFeeStructureBtn.textContent =
            "Save Fee";

    }

}

function closeFeesPanel() {

    feesManagementPanel.classList.add(
        "hidden"
    );

}
async function openFees(
    studentId
) {

    try {
        feesManagementPanel.dataset.studentId =
    studentId;

        feesManagementPanel.classList.remove(
            "hidden"
        );

        feesStudentName.textContent =
            "Loading...";

        feesStudentDetails.textContent =
            "";

        const academicYear =
            getCurrentAcademicYear();

        const [
            studentData,
            feeData,
            paymentData
        ] =
            await Promise.all([

                API.get(
                    `/api/students/${studentId}`
                ),

                API.get(
                    `/api/fee-structures/student/${studentId}?academicYear=${encodeURIComponent(academicYear)}`
                ),

                API.get(
                    `/api/fee-payments/student/${studentId}/total?academicYear=${encodeURIComponent(academicYear)}`
                )

            ]);

        if (
            !studentData.success
        ) {

            throw new Error(
                studentData.message ||
                "Unable to load student"
            );

        }

        if (
            !feeData.success
        ) {

            throw new Error(
                feeData.message ||
                "Unable to load fee structure"
            );

        }

        if (
            !paymentData.success
        ) {

            throw new Error(
                paymentData.message ||
                "Unable to load payments"
            );

        }

        const student =
            studentData.student;

        const totalFee =
            (
                feeData.feeStructures ||
                []
            )
                .filter(
                    fee =>
                        fee.status === "active"
                )
                .reduce(
                    (
                        total,
                        fee
                    ) =>
                        total +
                        Number(
                            fee.amount ||
                            0
                        ),
                    0
                );

        const totalPaid =
            Number(
                paymentData.totalPaid ||
                0
            );

        const balance =
            totalFee -
            totalPaid;

        feesStudentName.textContent =
            student.name;

        feesStudentDetails.textContent =
            `${student.admission_no} • ${student.class_name || "-"} / ${student.section || "-"}`;

        managementTotalFee.textContent =
            formatCurrency(
                totalFee
            );

        managementTotalPaid.textContent =
            formatCurrency(
                totalPaid
            );

        managementBalance.textContent =
            formatCurrency(
                balance
            );
        feesManagementPanel.dataset.balance =
                balance;

        managementBalance.className =
            `mt-2 text-2xl font-bold ${
                balance > 0
                    ? "text-red-700"
                    : "text-emerald-700"
            }`;

        renderFeeStructures(
    feeData.feeStructures
);

await loadPaymentHistory(
    studentId,
    academicYear
);

        feesManagementPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
    catch (err) {

        console.error(err);

        feesStudentName.textContent =
            "Unable to load fees";

        feesStudentDetails.textContent =
            err.message ||
            "Unable to load student fees.";

    }

}

loadStudents();

async function loadStudents() {

    try {

        feesStudentTableBody.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="px-6 py-10 text-center text-sm text-slate-500">

                    Loading students...

                </td>

            </tr>
        `;

        const data =
            await API.get(
                "/api/students"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load students"
            );

        }

        const activeStudents =
            (
                data.students ||
                []
            ).filter(
                student =>
                    student.status === "active"
            );

        renderStudents(
            activeStudents
        );

    }
    catch (err) {

        console.error(err);

        feesStudentTableBody.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="px-6 py-10 text-center text-sm text-red-600">

                    Unable to load students.

                </td>

            </tr>
        `;

    }

}

async function getStudentFeeSummary(
    studentId,
    academicYear
) {

    const [
        feeData,
        paymentData
    ] =
        await Promise.all([

            API.get(
                `/api/fee-structures/student/${studentId}?academicYear=${encodeURIComponent(academicYear)}`
            ),

            API.get(
                `/api/fee-payments/student/${studentId}/total?academicYear=${encodeURIComponent(academicYear)}`
            )

        ]);

    if (
        !feeData.success
    ) {

        throw new Error(
            feeData.message ||
            "Unable to load fee structure"
        );

    }

    if (
        !paymentData.success
    ) {

        throw new Error(
            paymentData.message ||
            "Unable to load fee payments"
        );

    }

    const totalFee =
        (
            feeData.feeStructures ||
            []
        )
            .filter(
                fee =>
                    fee.status === "active"
            )
            .reduce(
                (
                    total,
                    fee
                ) =>
                    total +
                    Number(
                        fee.amount ||
                        0
                    ),
                0
            );

    const totalPaid =
        Number(
            paymentData.totalPaid ||
            0
        );

    const balance =
        totalFee -
        totalPaid;

    return {

        totalFee,

        totalPaid,

        balance

    };

}

async function renderStudents(
    students
) {

    if (
        !students ||
        students.length === 0
    ) {

        feesStudentTableBody.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="px-6 py-10 text-center text-sm text-slate-500">

                    No active students found.

                </td>

            </tr>
        `;

        return;

    }

    feesStudentTableBody.innerHTML = `
        <tr>

            <td
                colspan="7"
                class="px-6 py-10 text-center text-sm text-slate-500">

                Loading fee details...

            </td>

        </tr>
    `;

    const academicYear =
    getCurrentAcademicYear();

    try {

        const studentsWithFees =
            await Promise.all(
                students.map(
                    async student => {

                        const feeSummary =
                            await getStudentFeeSummary(
                                student.id,
                                academicYear
                            );

                        return {

                            ...student,

                            ...feeSummary

                        };

                    }
                )
            );

        feesStudentTableBody.innerHTML =
            studentsWithFees
                .map(
                    student => {

                        const balance =
                            Number(
                                student.balance ||
                                0
                            );

                        return `

                            <tr
                                class="border-t border-slate-100">

                                <td
                                    class="px-6 py-4 text-sm text-slate-600">

                                    ${escapeHtml(
                                        student.admission_no
                                    )}

                                </td>

                                <td
                                    class="px-6 py-4">

                                    <div
                                        class="font-medium text-slate-800">

                                        ${escapeHtml(
                                            student.name
                                        )}

                                    </div>

                                    <div
                                        class="mt-1 text-xs text-slate-500">

                                        ${escapeHtml(
                                            student.father_name ||
                                            "-"
                                        )}

                                    </div>

                                </td>

                                <td
                                    class="px-6 py-4 text-sm text-slate-600">

                                    ${escapeHtml(
                                        student.class_name ||
                                        "-"
                                    )}
                                    /
                                    ${escapeHtml(
                                        student.section ||
                                        "-"
                                    )}

                                </td>

                                <td
                                    class="px-6 py-4 text-right text-sm text-slate-600">

                                    ${formatCurrency(
                                        student.totalFee
                                    )}

                                </td>

                                <td
                                    class="px-6 py-4 text-right text-sm text-emerald-600">

                                    ${formatCurrency(
                                        student.totalPaid
                                    )}

                                </td>

                                <td
                                    class="px-6 py-4 text-right text-sm font-medium ${
                                        balance > 0
                                        ? "text-red-600"
                                        : "text-emerald-600"
                                    }">

                                    ${formatCurrency(
                                        balance
                                    )}

                                </td>

                                <td
                                    class="px-6 py-4">

                                    <button
                                        type="button"
                                        onclick="openFees(${student.id})"
                                        class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">

                                        Manage Fees

                                    </button>

                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }
    catch (err) {

        console.error(err);

        feesStudentTableBody.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="px-6 py-10 text-center text-sm text-red-600">

                    Unable to load fee details.

                </td>

            </tr>
        `;

    }

}
function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(
            amount ||
            0
        )
    );

}
function renderFeeStructures(
    feeStructures
) {

    const activeFees =
        (
            feeStructures ||
            []
        ).filter(
            fee =>
                fee.status === "active"
        );

    if (
        activeFees.length === 0
    ) {

        feeStructuresBody.innerHTML = `
            <tr>

                <td
                    colspan="3"
                    class="px-4 py-6 text-center text-sm text-slate-500">

                    No fee structure found.

                </td>

            </tr>
        `;

        return;

    }

    feeStructuresBody.innerHTML =
        activeFees
            .map(
                fee => `
                    <tr
                        class="border-t border-slate-100">

                        <td
                            class="px-4 py-3 text-sm font-medium text-slate-700">

                            ${escapeHtml(
                                fee.fee_head
                            )}

                        </td>

                        <td
                            class="px-4 py-3 text-right text-sm font-medium text-slate-700">

                            ${formatCurrency(
                                Number(
                                    fee.amount ||
                                    0
                                )
                            )}

                        </td>

                        <td
                            class="px-4 py-3 text-sm text-slate-600">

                            ${escapeHtml(
                                fee.effective_from ||
                                "-"
                            )}

                        </td>

                    </tr>
                `
            )
            .join("");

}


async function loadPaymentHistory(
    studentId,
    academicYear
) {

    try {

        const paymentData =
            await API.get(
                `/api/fee-payments/student/${studentId}?academicYear=${encodeURIComponent(academicYear)}`
            );

        if (
            !paymentData.success
        ) {

            throw new Error(
                paymentData.message ||
                "Unable to load payments"
            );

        }

        renderPaymentHistory(
            paymentData.payments
        );

    }
    catch (err) {

        console.error(err);

        feePaymentsBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="px-4 py-6 text-center text-sm text-red-600">

                    Unable to load payment history.

                </td>

            </tr>
        `;

    }

}


function renderPaymentHistory(
    payments
) {

    if (
        !payments ||
        payments.length === 0
    ) {

        feePaymentsBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="px-4 py-6 text-center text-sm text-slate-500">

                    No payments found.

                </td>

            </tr>
        `;

        return;

    }

    feePaymentsBody.innerHTML =
        payments
            .map(
                payment => `
                    <tr
                        class="border-t border-slate-100">

                        <td
                            class="px-4 py-3 text-sm text-slate-600">

                            ${escapeHtml(
                                payment.payment_date ||
                                "-"
                            )}

                        </td>

                        <td
                            class="px-4 py-3 text-right text-sm font-medium text-slate-700">

                            ${formatCurrency(
                                Number(
                                    payment.amount ||
                                    0
                                )
                            )}

                        </td>

                        <td
                            class="px-4 py-3 text-sm text-slate-600">

                            ${escapeHtml(
                                payment.payment_mode ||
                                "-"
                            )}

                        </td>

                        <td
                            class="px-4 py-3 text-sm text-slate-600">

                            ${escapeHtml(
                                payment.receipt_no ||
                                "-"
                            )}

                        </td>

                    </tr>
                `
            )
            .join("");

}

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
