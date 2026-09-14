Auth.requireLogin("/ledger/login.html");

const token = localStorage.getItem("token");
const partyId = new URLSearchParams(window.location.search).get("id");

const partyLoading = document.getElementById("partyLoading");
const partyError = document.getElementById("partyError");
const partyDetails = document.getElementById("partyDetails");
const partyName = document.getElementById("partyName");
const partyMobile = document.getElementById("partyMobile");
const partyBalance = document.getElementById("partyBalance");
const partyBalanceLabel = document.getElementById("partyBalanceLabel");
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
    partyName.textContent = party.name || "Party";
    partyMobile.textContent = party.mobile || "No mobile number";

    const balance = Number(party.net_balance || 0);
    partyBalance.textContent = formatAmount(balance);

    if (party.balance_type === "receivable") {
        partyBalanceLabel.textContent = "YOU WILL GIVE";
    } else if (party.balance_type === "payable") {
        partyBalanceLabel.textContent = "YOU WILL GET";
    } else {
        partyBalanceLabel.textContent = "SETTLED";
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
                    <strong class="party-balance-amount">${amount}</strong>
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
