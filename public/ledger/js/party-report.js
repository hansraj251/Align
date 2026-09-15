Auth.requireLogin("/ledger/login.html");

const token =
    localStorage.getItem("token");

const params =
    new URLSearchParams(
        window.location.search
    );

const partyId =
    params.get("id");

const partyLoading =
    document.getElementById(
        "partyLoading"
    );

const partyError =
    document.getElementById(
        "partyError"
    );

const partyDetails =
    document.getElementById(
        "partyDetails"
    );

const partyName =
    document.getElementById(
        "partyName"
    );

const partyMobile =
    document.getElementById(
        "partyMobile"
    );

const partyEmail =
    document.getElementById(
        "partyEmail"
    );

const partyAddress =
    document.getElementById(
        "partyAddress"
    );

const partyBalance =
    document.getElementById(
        "partyBalance"
    );

const partyBalanceLabel =
    document.getElementById(
        "partyBalanceLabel"
    );

const partyInterest =
    document.getElementById(
        "partyInterest"
    );

const interestReceivedCard =
    document.getElementById(
        "interestReceivedCard"
    );

const interestReceivedTotal =
    document.getElementById(
        "interestReceivedTotal"
    );

const interestReceivedList =
    document.getElementById(
        "interestReceivedList"
    );

const transactionsList =
    document.getElementById(
        "transactionsList"
    );

function formatAmount(amount) {

    const value =
        Number(amount || 0);

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(
        Math.abs(value)
    );

}

function formatTransactionAmount(amount) {

    const value =
        Number(amount || 0);

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(
        Math.abs(value)
    );

}

function formatSignedAmount(amount) {

    const value =
        Number(amount || 0);

    const formatted =
        new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2
            }
        ).format(
            Math.abs(value)
        );

    return value < 0
        ? `-${formatted}`
        : formatted;

}

function calculateTransactionInterest(
    transaction,
    today = new Date()
) {

    const amount =
        Number(
            transaction.amount || 0
        );

    const annualRate =
        Number(
            transaction.interest_rate || 0
        );

    const transactionDate =
        transaction.transaction_date;

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(annualRate) ||
        !transactionDate ||
        amount <= 0 ||
        annualRate < 0
    ) {
        return 0;
    }

    const start =
        new Date(
            `${transactionDate}T00:00:00Z`
        );

    const end =
        new Date(
            Date.UTC(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            )
        );

    if (
        Number.isNaN(
            start.getTime()
        ) ||
        end < start
    ) {
        return 0;
    }

    const days =
        Math.floor(
            (
                end.getTime() -
                start.getTime()
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );

    return (
        amount *
        (annualRate / 100) *
        (days / 365)
    );

}

function calculateNetInterest(
    transactions
) {

    return transactions.reduce(
        (
            total,
            transaction
        ) => {

            const interest =
                calculateTransactionInterest(
                    transaction
                );

            return transaction.transaction_type ===
                "debit"
                ? total + interest
                : total - interest;

        },
        0
    );

}

function formatInterestReceivedDate(
    date
) {

    if (!date) {
        return "";
    }

    const parsed =
        new Date(
            `${date}T00:00:00`
        );

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
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

function showError(message) {

    partyLoading.hidden = true;

    partyDetails.hidden = true;

    partyError.hidden = false;

    const messageElement =
        partyError.querySelector(
            "p"
        );

    if (messageElement) {

        messageElement.textContent =
            message;

    }

}

function renderParty(
    party
) {

    partyName.textContent =
        party.name || "Party";

    partyMobile.textContent =
        party.mobile ||
        "No mobile number";

    partyEmail.textContent =
        party.email ||
        "No mail address";

    partyAddress.textContent =
        party.address ||
        "No address";

    const balance =
        Number(
            party.net_balance || 0
        );

    partyBalance.textContent =
        formatAmount(balance);

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

    if (
        party.balance_type ===
        "receivable"
    ) {

        partyBalanceLabel.textContent =
            "YOU WILL GIVE";

        partyBalanceLabel.classList.add(
            "party-balance-give"
        );

        partyBalance.classList.add(
            "party-balance-give"
        );

    } else if (
        party.balance_type ===
        "payable"
    ) {

        partyBalanceLabel.textContent =
            "YOU WILL GET";

        partyBalanceLabel.classList.add(
            "party-balance-get"
        );

        partyBalance.classList.add(
            "party-balance-get"
        );

    } else {

        partyBalanceLabel.textContent =
            "SETTLED";

        partyBalanceLabel.classList.add(
            "party-balance-settled"
        );

        partyBalance.classList.add(
            "party-balance-settled"
        );

    }

    partyLoading.hidden = true;

    partyError.hidden = true;

    partyDetails.hidden = false;

}

function renderTransactions(
    transactions
) {

    const items =
        Array.isArray(
            transactions
        )
            ? transactions
            : [];

    if (!transactionsList) {
        return;
    }

    if (items.length === 0) {

        transactionsList.innerHTML =
            '<div class="empty-state compact"><h2>No transactions yet</h2><p>No transactions recorded for this party.</p></div>';

        return;

    }

    transactionsList.innerHTML =
        items.map(
            (
                transaction
            ) => {

                const amount =
                    formatTransactionAmount(
                        transaction.amount
                    );

                const description =
                    transaction.description ||
                    "Transaction";

                const typeLabel =
                    transaction.transaction_type ===
                    "credit"
                        ? "You Got"
                        : "You Gave";

                const hasInterest =
                    Number(
                        transaction.interest_rate || 0
                    ) > 0;

                const interestLabel =
                    hasInterest
                        ? `<span class="party-transaction-interest"> (INT. ${formatAmount(
                            calculateTransactionInterest(
                                transaction
                            )
                        )})</span>`
                        : "";

                return `
                    <article class="party-row">
                        <div class="party-info">
                            <strong class="party-name">${description}</strong>
                            <span class="party-mobile">${transaction.transaction_date || ""}</span>
                        </div>
                        <div class="party-balance ${
                            transaction.transaction_type ===
                            "credit"
                                ? "transaction-got"
                                : "transaction-gave"
                        }">
                            <span class="party-balance-label">${typeLabel}</span>
                            <strong class="party-balance-amount">
                                <span class="party-transaction-amount">${amount}</span>${interestLabel}
                            </strong>
                        </div>
                    </article>
                `;

            }
        ).join("");

}

function renderInterestReceived(
    entries,
    total,
    transactions
) {

    const items =
        Array.isArray(entries)
            ? entries
            : [];

    if (interestReceivedTotal) {

        interestReceivedTotal.textContent =
            formatSignedAmount(
                total
            );

    }

    if (
        !interestReceivedList
    ) {
        return;
    }

    if (items.length === 0) {

        interestReceivedList.innerHTML =
            '<div class="empty-state compact"><h2>No interest received/paid yet</h2><p>No interest entries recorded for this party.</p></div>';

    } else {

        interestReceivedList.innerHTML =
            items.map(
                (entry) => {

                    const amount =
                        formatSignedAmount(
                            entry.amount
                        );

                    const note =
                        entry.note || "";

                    return `
                        <article class="interest-received-row">
                            <div class="interest-received-info">
                                <strong>
                                    ${formatInterestReceivedDate(
                                        entry.interest_date
                                    )}
                                </strong>
                                <br>
                                <strong>${amount}</strong>
                                ${
                                    note
                                        ? `<br><span>${note}</span>`
                                        : ""
                                }
                            </div>
                        </article>
                    `;

                }
            ).join("");

    }

    if (partyInterest) {

        const totalInterestReceived =
            Number(
                total || 0
            );

        const calculatedNetInterest =
            calculateNetInterest(
                Array.isArray(transactions)
                    ? transactions
                    : []
            );

        const remainingInterest =
            calculatedNetInterest -
            totalInterestReceived;

        partyInterest.textContent =
            formatSignedAmount(
                remainingInterest
            );

        const hasInterest =
            remainingInterest !== 0;

        if (interestReceivedCard) {

            interestReceivedCard.hidden =
                !hasInterest;

        }

        partyInterest.classList.remove(
            "party-interest-positive",
            "party-interest-negative"
        );

        if (remainingInterest > 0) {

            partyInterest.classList.add(
                "party-interest-positive"
            );

        } else if (
            remainingInterest < 0
        ) {

            partyInterest.classList.add(
                "party-interest-negative"
            );

        }

    }

}

async function loadReport() {

    if (!token) {

        Auth.logout(
            "/ledger/login.html"
        );

        return;

    }

    const endpoint =
        partyId
            ? `/api/ledger/party-report/${encodeURIComponent(
                partyId
            )}`
            : "/api/ledger/party-report/";

    const response =
        await fetch(
            endpoint,
            {
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

        Auth.logout(
            "/ledger/login.html"
        );

        return;

    }

    const data =
        await response.json();

    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Unable to load party report."
        );

    }

    if (!data.report) {

        throw new Error(
            "Party report not found."
        );

    }

    const report =
        data.report;

    renderParty(
        report.party
    );

    renderTransactions(
        report.transactions
    );

    renderInterestReceived(
        report.interestReceived,
        report.totalInterestReceived,
        report.transactions
    );

}

loadReport().catch(
    (error) => {

        console.error(
            "Ledger party report load failed:",
            error
        );

        showError(
            error.message ||
            "Unable to load party report."
        );

    }
);
