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

    const confirmed = confirm(
        `Delete ${loadedParty?.name || "this party"}?`
    );

    if (!confirmed) {
        return;
    }

    try {
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
    } catch (error) {
        console.error("Delete party failed:", error);
        alert(error.message || "Unable to delete party.");
    }
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

    if (partyInterest) {
        const netInterest = calculateNetInterest(loadedTransactions);
        const interestCard = partyInterest.closest(".summary-card");

        partyInterest.classList.remove(
            "party-interest-positive",
            "party-interest-negative"
        );

        if (interestCard) {
            interestCard.hidden = netInterest === 0;
        }

        partyInterest.textContent = formatSignedAmount(netInterest);

        if (netInterest > 0) {
            partyInterest.classList.add("party-interest-positive");
        } else if (netInterest < 0) {
            partyInterest.classList.add("party-interest-negative");
        }
    }

    if (loadedTransactions.length === 0) {
        transactionsList.innerHTML =
            '<div class="empty-state compact"><h2>No transactions yet</h2><p>Add the first transaction to start this khata.</p></div>';
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

    const confirmed = window.confirm(
        "Delete this transaction?"
    );

    if (!confirmed) {
        return;
    }

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
    }
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
