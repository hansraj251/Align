Auth.requireLogin("/ledger/login.html");

const token = localStorage.getItem("token");
const partyId = new URLSearchParams(window.location.search).get("id");

const partyLoading = document.getElementById("partyLoading");
const partyError = document.getElementById("partyError");
const partyDetails = document.getElementById("partyDetails");
const partyName = document.getElementById("partyName");
const partyMobile = document.getElementById("partyMobile");
const partyHeaderDetails = document.getElementById("partyHeaderDetails");

const partyHeaderActions = document.getElementById("partyHeaderActions");

const editPartyButton = document.getElementById("editPartyButton");

const deletePartyButton = document.getElementById("deletePartyButton");

const editPartyModal = document.getElementById("editPartyModal");

const closeEditPartyModal = document.getElementById("closeEditPartyModal");

const cancelEditPartyButton = document.getElementById("cancelEditPartyButton");

const editPartyForm = document.getElementById("editPartyForm");

const editPartyName = document.getElementById("editPartyName");

const editPartyMobile = document.getElementById("editPartyMobile");

const editPartyAddress = document.getElementById("editPartyAddress");

const editPartyFormError = document.getElementById("editPartyFormError");

const partyBalance = document.getElementById("partyBalance");
const partyBalanceLabel = document.getElementById("partyBalanceLabel");
const partyInterest = document.getElementById("partyInterest");
const transactionsList = document.getElementById("transactionsList");
const addTransactionButton = document.getElementById("addTransactionButton");
const transactionModal = document.getElementById("transactionModal");
const closeTransactionModal = document.getElementById("closeTransactionModal");
const cancelTransactionButton = document.getElementById("cancelTransactionButton");
const transactionForm = document.getElementById("transactionForm");
const transactionType = document.getElementById("transactionType");
const transactionTypeButtons = document.querySelectorAll(
    "[data-transaction-type]"
);
const transactionAmount = document.getElementById("transactionAmount");
const transactionDate = document.getElementById("transactionDate");
const transactionInterestRate = document.getElementById("transactionInterestRate");
const transactionDescription = document.getElementById("transactionDescription");
const transactionFormError = document.getElementById("transactionFormError");
const transactionModalTitle = document.getElementById("transactionModalTitle");
const interestReceivedCard =
    document.getElementById("interestReceivedCard");

const interestReceivedModal =
    document.getElementById("interestReceivedModal");

const closeInterestReceivedModal =
    document.getElementById("closeInterestReceivedModal");

const addInterestReceivedButton =
    document.getElementById("addInterestReceivedButton");

const interestReceivedForm =
    document.getElementById("interestReceivedForm");

const interestReceivedId =
    document.getElementById("interestReceivedId");

const interestReceivedDate =
    document.getElementById("interestReceivedDate");

const interestReceivedAmount =
    document.getElementById("interestReceivedAmount");

const interestReceivedNote =
    document.getElementById("interestReceivedNote");

const cancelInterestReceivedButton =
    document.getElementById("cancelInterestReceivedButton");

const interestReceivedSubmitButton =
    document.getElementById("interestReceivedSubmitButton");

const interestReceivedFormError =
    document.getElementById("interestReceivedFormError");

const interestReceivedTotal =
    document.getElementById("interestReceivedTotal");

const interestReceivedList =
    document.getElementById("interestReceivedList");

let loadedInterestReceived = [];
let editingInterestReceivedId = null;

const transactionSubmitButton =
    document.getElementById("transactionSubmitButton");

let editingTransactionId = null;
let loadedTransactions = [];

let loadedParty = null;

function openEditPartyModal() {
    if (!loadedParty || !editPartyModal) {
        return;
    }

    editPartyName.value = loadedParty.name || "";
    editPartyMobile.value = loadedParty.mobile || "";
    editPartyAddress.value = loadedParty.address || "";

    if (editPartyFormError) {
        editPartyFormError.hidden = true;
        editPartyFormError.textContent = "";
    }

    editPartyModal.hidden = false;

    setTimeout(() => {
        editPartyName.focus();
    }, 50);
}

function closeEditPartyModalDialog() {
    if (editPartyModal) {
        editPartyModal.hidden = true;
    }
}

async function updateParty() {
    if (!partyId || !editPartyForm) {
        return;
    }

    const payload = {
        name: editPartyName.value.trim(),
        mobile: editPartyMobile.value.trim(),
        address: editPartyAddress.value.trim()
    };

    if (!payload.name) {
        if (editPartyFormError) {
            editPartyFormError.textContent = "Party name is required.";
            editPartyFormError.hidden = false;
        }
        return;
    }

    const submitButton = editPartyForm.querySelector(".primary-button");

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const response = await fetch(
            `/api/ledger/parties/${encodeURIComponent(partyId)}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        if (response.status === 401 || response.status === 403) {
            Auth.logout("/ledger/login.html");
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success || !data.party) {
            throw new Error(
                data.message || "Unable to update party."
            );
        }

        closeEditPartyModalDialog();
        renderParty(data.party);
    } catch (error) {
        console.error("Update party failed:", error);

        if (editPartyFormError) {
            editPartyFormError.textContent =
                error.message || "Unable to update party.";
            editPartyFormError.hidden = false;
        }
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

async function deleteParty() {
    if (!partyId) {
        return;
    }

    Modal.confirm(
        "Delete",
        `
            <p class="text-slate-600">
                Are you sure you want to delete
                <span class="font-semibold text-slate-800">
                    "${loadedParty?.name || "this person"}"
                </span>
                ?
            </p>

        `,
        async () => {
            const response = await fetch(
                `/api/ledger/parties/${encodeURIComponent(partyId)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 401 || response.status === 403) {
                Auth.logout("/ledger/login.html");
                return;
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to delete party."
                );
            }

            window.location.href = "/ledger/index.html";
        },
        {
            buttonText: "Delete",
            buttonClass: "bg-red-600",
            loadingText: "Deleting..."
        }
    );
}

function togglePartyHeaderActions() {
    if (partyHeaderActions) {
        partyHeaderActions.hidden = !partyHeaderActions.hidden;
    }
}

if (partyHeaderDetails) {
    partyHeaderDetails.addEventListener("click", togglePartyHeaderActions);

    partyHeaderDetails.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePartyHeaderActions();
        }
    });
}

if (editPartyButton) {
    editPartyButton.addEventListener("click", openEditPartyModal);
}

if (deletePartyButton) {
    deletePartyButton.addEventListener("click", deleteParty);
}

if (closeEditPartyModal) {
    closeEditPartyModal.addEventListener(
        "click",
        closeEditPartyModalDialog
    );
}

if (cancelEditPartyButton) {
    cancelEditPartyButton.addEventListener(
        "click",
        closeEditPartyModalDialog
    );
}

if (editPartyForm) {
    editPartyForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await updateParty();
    });
}


function setTransactionType(type) {
    const selectedType =
        type === "credit" ? "credit" : "debit";

    if (transactionType) {
        transactionType.value = selectedType;
    }

    transactionTypeButtons.forEach((button) => {
        const selected =
            button.dataset.transactionType === selectedType;

        button.classList.toggle(
            "active",
            selected
        );

        button.setAttribute(
            "aria-pressed",
            String(selected)
        );
    });
}

transactionTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setTransactionType(
            button.dataset.transactionType
        );
    });
});

function formatAmount(amount) {
    const value = Number(amount || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(Math.abs(value));
}

function formatTransactionAmount(amount) {
    const value = Number(amount || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.abs(value));
}

function calculateTransactionInterest(transaction, today = new Date()) {
    const amount = Number(transaction.amount || 0);
    const annualRate = Number(transaction.interest_rate || 0);
    const transactionDate = transaction.transaction_date;

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(annualRate) ||
        !transactionDate ||
        amount <= 0 ||
        annualRate < 0
    ) {
        return 0;
    }

    const start = new Date(`${transactionDate}T00:00:00Z`);
    const end = new Date(
        Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        )
    );

    if (Number.isNaN(start.getTime()) || end < start) {
        return 0;
    }

    const days = Math.floor(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    return amount * (annualRate / 100) * (days / 365);
}

function calculateNetInterest(transactions, today = new Date()) {
    return transactions.reduce((total, transaction) => {
        const interest = calculateTransactionInterest(transaction, today);

        return transaction.transaction_type === "debit"
            ? total + interest
            : total - interest;
    }, 0);
}

function formatSignedAmount(amount) {
    const value = Number(amount || 0);
    const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(Math.abs(value));

    return value < 0 ? `-${formatted}` : formatted;
}

function formatInterestReceivedDate(date) {
    if (!date) {
        return "";
    }

    const parsed =
        new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(parsed);
}

function setInterestReceivedFormMode(entry = null) {
    editingInterestReceivedId =
        entry && entry.id
            ? entry.id
            : null;

    if (interestReceivedId) {
        interestReceivedId.value =
            editingInterestReceivedId || "";
    }

    if (interestReceivedSubmitButton) {
        interestReceivedSubmitButton.textContent =
            editingInterestReceivedId
                ? "Update"
                : "Save";
    }
}

function resetInterestReceivedForm() {
    if (interestReceivedForm) {
        interestReceivedForm.reset();
    }

    setInterestReceivedFormMode(null);

    if (interestReceivedFormError) {
        interestReceivedFormError.hidden = true;
        interestReceivedFormError.textContent = "";
    }
}

function openInterestReceivedForm(entry = null) {
    resetInterestReceivedForm();

    setInterestReceivedFormMode(entry);

    if (entry) {
        interestReceivedDate.value =
            entry.interest_date || "";

        interestReceivedAmount.value =
            entry.amount ?? "";

        interestReceivedNote.value =
            entry.note || "";
    } else {
        interestReceivedDate.value =
            new Date().toISOString().slice(0, 10);
    }

    if (interestReceivedForm) {
        interestReceivedForm.hidden = false;
    }

    if (addInterestReceivedButton) {
        addInterestReceivedButton.hidden = true;
    }

    if (interestReceivedAmount) {
        setTimeout(
            () => interestReceivedAmount.focus(),
            50
        );
    }
}

function closeInterestReceivedForm() {
    if (interestReceivedForm) {
        interestReceivedForm.hidden = true;
    }

    if (addInterestReceivedButton) {
        addInterestReceivedButton.hidden = false;
    }

    resetInterestReceivedForm();
}

function renderInterestReceived(entries, total) {
    loadedInterestReceived =
        Array.isArray(entries)
            ? entries
            : [];

    if (interestReceivedTotal) {
        interestReceivedTotal.textContent =
            formatAmount(total);
    }

    if (!interestReceivedList) {
        return;
    }

    if (loadedInterestReceived.length === 0) {
        interestReceivedList.innerHTML =
            '<div class="empty-state compact"><h2>No interest received/paid yet</h2><p>Add a received/paid interest entry to start.</p></div>';
        return;
    }

    interestReceivedList.innerHTML =
        loadedInterestReceived.map((entry) => {
            const amount =
                formatTransactionAmount(
                    entry.amount
                );

            const note =
                entry.note || "";

            return `
                <article
                    class="interest-received-row"
                    data-interest-id="${entry.id}"
                >
                    <div class="interest-received-info">
                        <strong>
                            ${formatInterestReceivedDate(entry.interest_date)}
                        </strong>
                        ${
                            note
                                ? `<span>${note}</span>`
                                : ""
                        }
                    </div>

                    <div class="interest-received-actions">
                        <strong>${amount}</strong>

                        <div class="transaction-actions">
                            <button
                                type="button"
                                class="secondary-button"
                                data-interest-action="edit"
                                data-interest-id="${entry.id}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="secondary-button"
                                data-interest-action="delete"
                                data-interest-id="${entry.id}"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
}

async function loadInterestReceived() {
    if (!partyId || !token) {
        return;
    }

    const response =
        await fetch(
            `/api/ledger/interest-received/party/${encodeURIComponent(partyId)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

    if (
        response.status === 401 ||
        response.status === 403
    ) {
        Auth.logout("/ledger/login.html");
        return;
    }

    const data =
        await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ||
            "Unable to load interest received."
        );
    }

    renderInterestReceived(
        data.entries || [],
        data.totalInterestReceived || 0
    );

    if (partyInterest) {
        const totalInterestReceived =
            Number(data.totalInterestReceived || 0);

        const calculatedNetInterest =
            calculateNetInterest(loadedTransactions);

        const remainingInterest =
            calculatedNetInterest - totalInterestReceived;

        partyInterest.textContent =
            formatSignedAmount(remainingInterest);

        const interestCard =
            partyInterest.closest(".summary-card");

        const balanceCard =
            partyBalance?.closest(".summary-card");

        const hasInterest =
            remainingInterest !== 0;

        if (interestCard) {
            interestCard.hidden = !hasInterest;
        }

        balanceCard?.classList.toggle(
            "full-width",
            !hasInterest
        );

        partyInterest.classList.remove(
            "party-interest-positive",
            "party-interest-negative"
        );

        if (remainingInterest > 0) {
            partyInterest.classList.add(
                "party-interest-positive"
            );
        } else if (remainingInterest < 0) {
            partyInterest.classList.add(
                "party-interest-negative"
            );
        }
    }
}

function openInterestReceivedModalDialog() {
    if (!interestReceivedModal) {
        return;
    }

    closeInterestReceivedForm();
    interestReceivedModal.hidden = false;

    loadInterestReceived().catch((error) => {
        console.error(
            "Ledger interest received load failed:",
            error
        );
    });
}

function closeInterestReceivedModalDialog() {
    if (interestReceivedModal) {
        interestReceivedModal.hidden = true;
    }

    closeInterestReceivedForm();
}

async function saveInterestReceived(event) {
    event.preventDefault();

    if (!partyId || !token) {
        return;
    }

    const amount =
        Number(interestReceivedAmount.value);

    if (
        !Number.isFinite(amount) ||
        amount === 0
    ) {
        if (interestReceivedFormError) {
            interestReceivedFormError.textContent =
                "Enter a valid amount.";
            interestReceivedFormError.hidden = false;
        }
        return;
    }

    if (!interestReceivedDate.value) {
        if (interestReceivedFormError) {
            interestReceivedFormError.textContent =
                "Select a date.";
            interestReceivedFormError.hidden = false;
        }
        return;
    }

    const payload = {
        interestDate:
            interestReceivedDate.value,
        amount,
        note:
            interestReceivedNote.value.trim()
    };

    try {
        const endpoint =
            editingInterestReceivedId
                ? `/api/ledger/interest-received/party/${encodeURIComponent(partyId)}/${encodeURIComponent(editingInterestReceivedId)}`
                : `/api/ledger/interest-received/party/${encodeURIComponent(partyId)}`;

        const response =
            await fetch(
                endpoint,
                {
                    method:
                        editingInterestReceivedId
                            ? "PUT"
                            : "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(payload)
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            Auth.logout("/ledger/login.html");
            return;
        }

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Unable to save interest entry."
            );
        }

        closeInterestReceivedForm();

        await loadInterestReceived();
    } catch (error) {
        console.error(
            "Ledger interest received save failed:",
            error
        );

        if (interestReceivedFormError) {
            interestReceivedFormError.textContent =
                error.message ||
                "Unable to save interest entry.";
            interestReceivedFormError.hidden = false;
        }
    }
}

function editInterestReceived(interestId) {
    const entry =
        loadedInterestReceived.find(
            (item) =>
                String(item.id) ===
                String(interestId)
        );

    if (!entry) {
        return;
    }

    openInterestReceivedForm(entry);
}

async function deleteInterestReceived(interestId) {
    if (!partyId || !token) {
        return;
    }

    const entry =
        loadedInterestReceived.find(
            (item) =>
                String(item.id) ===
                String(interestId)
        );

    Modal.confirm(
        "Delete Interest",
        `
            <p class="text-slate-600">
                Are you sure you want to delete this
                interest entry?
            </p>
            ${
                entry
                    ? `<p class="mt-2 text-sm text-slate-500">${formatInterestReceivedDate(entry.interest_date)} · ${formatAmount(entry.amount)}</p>`
                    : ""
            }
            <p class="mt-2 text-sm text-red-600">
                This action cannot be undone.
            </p>
        `,
        async () => {
            const response =
                await fetch(
                    `/api/ledger/interest-received/party/${encodeURIComponent(partyId)}/${encodeURIComponent(interestId)}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                Auth.logout("/ledger/login.html");
                return;
            }

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to delete interest entry."
                );
            }

            await loadInterestReceived();
        },
        {
            buttonText: "Delete",
            buttonClass: "bg-red-600",
            loadingText: "Deleting..."
        }
    );
}

function handleInterestReceivedAction(event) {
    const button =
        event.target.closest(
            "[data-interest-action][data-interest-id]"
        );

    if (!button) {
        return;
    }

    const interestId =
        button.dataset.interestId;

    if (
        button.dataset.interestAction === "edit"
    ) {
        editInterestReceived(interestId);
    }

    if (
        button.dataset.interestAction === "delete"
    ) {
        deleteInterestReceived(interestId);
    }
}

function showError(message) {
    partyLoading.hidden = true;
    partyDetails.hidden = true;
    partyError.hidden = false;

    const messageElement = partyError.querySelector("p");

    if (messageElement) {
        messageElement.textContent = message;
    }
}

function renderParty(party) {
    loadedParty = party;
    partyName.textContent = party.name || "Party";
    partyMobile.textContent = party.mobile || "No mobile number";

    const balance = Number(party.net_balance || 0);
    partyBalance.textContent = formatAmount(balance);

    partyBalance.classList.remove(
        "party-balance-give",
        "party-balance-get",
        "party-balance-settled"
    );

    partyBalanceLabel.classList.remove(
        "party-balance-give",
        "party-balance-get",
        "party-balance-settled"
    );

    if (party.balance_type === "receivable") {
        partyBalanceLabel.textContent = "YOU WILL GIVE";
        partyBalanceLabel.classList.add("party-balance-give");
        partyBalance.classList.add("party-balance-give");
    } else if (party.balance_type === "payable") {
        partyBalanceLabel.textContent = "YOU WILL GET";
        partyBalanceLabel.classList.add("party-balance-get");
        partyBalance.classList.add("party-balance-get");
    } else {
        partyBalanceLabel.textContent = "SETTLED";
        partyBalanceLabel.classList.add("party-balance-settled");
        partyBalance.classList.add("party-balance-settled");
    }

    partyLoading.hidden = true;
    partyError.hidden = true;
    partyDetails.hidden = false;
}

function renderTransactions(transactions) {
    if (!transactionsList) {
        return;
    }

    loadedTransactions = Array.isArray(transactions)
        ? transactions
        : [];

    if (loadedTransactions.length === 0) {
        transactionsList.innerHTML =
            '<div class="empty-state compact"><h2>No transactions yet</h2><p>Add the first transaction to start.</p></div>';
        return;
    }

    transactionsList.innerHTML = loadedTransactions.map((transaction) => {
        const amount = formatTransactionAmount(transaction.amount);
        const description =
            transaction.description || "";

        const typeLabel =
            transaction.transaction_type === "credit"
                ? "You Got"
                : "You Gave";

        const hasInterest =
            Number(transaction.interest_rate || 0) > 0;

        const interestLabel = hasInterest
            ? `<span class="party-transaction-interest"> (INT. ${formatAmount(
                calculateTransactionInterest(transaction)
            )})</span>`
            : "";

        return `
            <article class="party-row" data-transaction-id="${transaction.id}">
                <div class="party-info">
                    <strong class="party-name">${description}</strong>
                    <span class="party-mobile">${transaction.transaction_date || ""}</span>
                </div>
                <div class="party-balance ${
                    transaction.transaction_type === "credit"
                        ? "transaction-got"
                        : "transaction-gave"
                }">
                    <span class="party-balance-label">${typeLabel}</span>
                    <strong class="party-balance-amount">
                        <span class="party-transaction-amount">${amount}</span>${interestLabel}
                    </strong>
                </div>
                <div class="transaction-actions">
                    <button
                        type="button"
                        class="secondary-button transaction-edit-button"
                        data-action="edit"
                        data-transaction-id="${transaction.id}"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        class="secondary-button transaction-delete-button"
                        data-action="delete"
                        data-transaction-id="${transaction.id}"
                    >
                        Delete
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

function setTransactionFormMode(transaction = null) {
    editingTransactionId =
        transaction && transaction.id
            ? transaction.id
            : null;

    if (transactionModalTitle) {
        transactionModalTitle.textContent =
            editingTransactionId
                ? "Edit Transaction"
                : "Add Transaction";
    }

    if (transactionSubmitButton) {
        transactionSubmitButton.textContent =
            editingTransactionId
                ? "Update"
                : "Save";
    }
}

function openEditTransaction(transactionId) {
    const transaction = loadedTransactions.find(
        (item) => String(item.id) === String(transactionId)
    );

    if (!transaction) {
        return;
    }

    setTransactionFormMode(transaction);

    setTransactionType(
        transaction.transaction_type || "credit"
    );

    transactionAmount.value =
        transaction.amount ?? "";

    transactionDate.value =
        transaction.transaction_date || "";

    transactionInterestRate.value =
        transaction.interest_rate ?? "";

    transactionDescription.value =
        transaction.description || "";

    if (transactionFormError) {
        transactionFormError.hidden = true;
        transactionFormError.textContent = "";
    }

    if (transactionModal) {
        transactionModal.hidden = false;
    }
}

async function deleteTransaction(transactionId) {
    if (!partyId || !token) {
        return;
    }

    Modal.confirm(
        "Delete Transaction",
        `
            <p class="text-slate-600">
                Are you sure you want to delete this transaction?
            </p>
            <p class="mt-2 text-sm text-red-600">
                This action cannot be undone.
            </p>
        `,
        async () => {
            try {
                const response = await fetch(
                    `/api/ledger/transactions/party/${encodeURIComponent(partyId)}/${encodeURIComponent(transactionId)}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    Auth.logout("/ledger/login.html");
                    return;
                }

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to delete transaction."
                    );
                }

                await loadPartyDetails();
                await loadTransactions();
            } catch (error) {
                console.error(
                    "Ledger transaction delete failed:",
                    error
                );

                if (transactionFormError) {
                    transactionFormError.textContent =
                        error.message || "Unable to delete transaction.";
                    transactionFormError.hidden = false;
                }

                throw error;
            }
        },
        {
            buttonText: "Delete",
            buttonClass: "bg-red-600",
            loadingText: "Deleting..."
        }
    );
}
function handleTransactionAction(event) {
    const button = event.target.closest(
        "[data-action][data-transaction-id]"
    );

    if (!button) {
        return;
    }

    const transactionId =
        button.dataset.transactionId;

    if (button.dataset.action === "edit") {
        openEditTransaction(transactionId);
    }

    if (button.dataset.action === "delete") {
        deleteTransaction(transactionId);
    }
}

async function loadTransactions() {
    const response = await fetch(
        `/api/ledger/transactions/party/${encodeURIComponent(partyId)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (response.status === 401 || response.status === 403) {
        Auth.logout("/ledger/login.html");
        return;
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Unable to load transactions."
        );
    }

    renderTransactions(data.transactions || []);
}

async function loadPartyDetails() {
    const response = await fetch(
        `/api/ledger/parties/${encodeURIComponent(partyId)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (response.status === 401 || response.status === 403) {
        Auth.logout("/ledger/login.html");
        return;
    }

    const data = await response.json();

    if (!response.ok || !data.success || !data.party) {
        throw new Error(
            data.message || "Unable to load party."
        );
    }

    renderParty(data.party);
}

async function loadParty() {
    if (!partyId) {
        showError("Party ID is missing.");
        return;
    }

    if (!token) {
        Auth.logout("/ledger/login.html");
        return;
    }

    try {
        await loadPartyDetails();
        await loadTransactions();
        await loadInterestReceived();
    } catch (error) {
        console.error("Ledger party load failed:", error);
        showError(
            error.message || "Unable to load party."
        );
    }
}

function openTransactionModal() {
    if (!transactionModal) {
        return;
    }

    setTransactionFormMode(null);

    if (transactionForm) {
        transactionForm.reset();
    }

    setTransactionType("debit");

    transactionModal.hidden = false;

    if (transactionDate && !transactionDate.value) {
        transactionDate.value =
            new Date().toISOString().slice(0, 10);
    }
}

function closeTransactionModalDialog() {
    if (transactionModal) {
        transactionModal.hidden = true;
    }

    setTransactionFormMode(null);

    if (transactionFormError) {
        transactionFormError.hidden = true;
        transactionFormError.textContent = "";
    }
}

async function saveTransaction(event) {
    event.preventDefault();

    if (!partyId || !token) {
        return;
    }

    const amount = Number(transactionAmount.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        if (transactionFormError) {
            transactionFormError.textContent =
                "Enter a valid amount.";
            transactionFormError.hidden = false;
        }
        return;
    }

    const interestRate = Number(transactionInterestRate.value);

    if (!Number.isFinite(interestRate) || interestRate < 0) {
        if (transactionFormError) {
            transactionFormError.textContent =
                "Enter a valid interest rate.";
            transactionFormError.hidden = false;
        }
        return;
    }

    const payload = {
        transactionType: transactionType.value,
        amount,
        transactionDate: transactionDate.value,
        description: transactionDescription.value.trim(),
        interestRate
    };

    try {
        const transactionEndpoint = editingTransactionId
            ? `/api/ledger/transactions/party/${encodeURIComponent(partyId)}/${encodeURIComponent(editingTransactionId)}`
            : `/api/ledger/transactions/party/${encodeURIComponent(partyId)}`;

        const response = await fetch(
            transactionEndpoint,
            {
                method: editingTransactionId
                    ? "PUT"
                    : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        if (response.status === 401 || response.status === 403) {
            Auth.logout("/ledger/login.html");
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to save transaction."
            );
        }

        closeTransactionModalDialog();
        transactionForm.reset();
        setTransactionFormMode(null);
        await loadPartyDetails();
        await loadTransactions();
    } catch (error) {
        console.error(
            "Ledger transaction save failed:",
            error
        );

        if (transactionFormError) {
            transactionFormError.textContent =
                error.message || "Unable to save transaction.";
            transactionFormError.hidden = false;
        }
    }
}

if (interestReceivedCard) {
    interestReceivedCard.addEventListener(
        "click",
        openInterestReceivedModalDialog
    );

    interestReceivedCard.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                openInterestReceivedModalDialog();
            }
        }
    );
}

if (closeInterestReceivedModal) {
    closeInterestReceivedModal.addEventListener(
        "click",
        closeInterestReceivedModalDialog
    );
}

if (addInterestReceivedButton) {
    addInterestReceivedButton.addEventListener(
        "click",
        () => openInterestReceivedForm()
    );
}

if (cancelInterestReceivedButton) {
    cancelInterestReceivedButton.addEventListener(
        "click",
        closeInterestReceivedForm
    );
}

if (interestReceivedForm) {
    interestReceivedForm.addEventListener(
        "submit",
        saveInterestReceived
    );
}

if (interestReceivedList) {
    interestReceivedList.addEventListener(
        "click",
        handleInterestReceivedAction
    );
}

if (addTransactionButton) {
    addTransactionButton.addEventListener(
        "click",
        openTransactionModal
    );
}

if (
    transactionsList &&
    typeof transactionsList.addEventListener === "function"
) {
    transactionsList.addEventListener(
        "click",
        handleTransactionAction
    );
}

if (closeTransactionModal) {
    closeTransactionModal.addEventListener(
        "click",
        closeTransactionModalDialog
    );
}

if (cancelTransactionButton) {
    cancelTransactionButton.addEventListener(
        "click",
        closeTransactionModalDialog
    );
}

if (transactionForm) {
    transactionForm.addEventListener(
        "submit",
        saveTransaction
    );
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        Auth.logout("/ledger/login.html");
    });
}

loadParty();
