(() => {
  "use strict";

  Auth.requireLogin("/ledger/login.html");

  const token =
    () => localStorage.getItem("token");

  const groupId =
    new URLSearchParams(window.location.search)
      .get("id");

  const $ =
    (id) => document.getElementById(id);

  let currentSummary = null;

  let editingExpenseId = null;

  let editingExpense = null;

  const els = {
    groupLoading: $("groupLoading"),
    groupError: $("groupError"),
    groupDetails: $("groupDetails"),
    groupName: $("groupName"),
    groupDescription: $("groupDescription"),
    groupHeaderDetails: $("groupHeaderDetails"),
    groupHeaderActions: $("groupHeaderActions"),
    editGroupButton: $("editGroupButton"),
    deleteGroupButton: $("deleteGroupButton"),
    editGroupModal: $("editGroupModal"),
    closeEditGroupModal: $("closeEditGroupModal"),
    cancelEditGroupButton: $("cancelEditGroupButton"),
    editGroupForm: $("editGroupForm"),
    editGroupName: $("editGroupName"),
    editGroupDescription: $("editGroupDescription"),
    editGroupSubmitButton: $("editGroupSubmitButton"),
    editGroupFormError: $("editGroupFormError"),
    totalExpenses: $("totalExpenses"),
    youWillGet: $("youWillGet"),
    youWillPay: $("youWillPay"),
    memberCount: $("memberCount"),
    membersTabButton: $("membersTabButton"),
    expensesTabButton: $("expensesTabButton"),
    membersSection: $("membersSection"),
    expensesSection: $("expensesSection"),
    membersList: $("membersList"),
    bottomAddMemberButton: $("bottomAddMemberButton"),
    bottomAddExpenseButton: $("bottomAddExpenseButton"),
    expenseCount: $("expenseCount"),
    expensesList: $("expensesList"),
    expensesEmpty: $("expensesEmpty"),
    addExpenseModalTitle: $("addExpenseModalTitle"),

    addExpenseModal: $("addExpenseModal"),
    closeAddExpenseModal: $("closeAddExpenseModal"),
    cancelAddExpenseButton: $("cancelAddExpenseButton"),
    addExpenseForm: $("addExpenseForm"),
    addExpenseDescription: $("addExpenseDescription"),
    addExpenseAmount: $("addExpenseAmount"),
    addExpenseDate: $("addExpenseDate"),
    addExpenseSubmitButton: $("addExpenseSubmitButton"),
    deleteExpenseButton: $("deleteExpenseButton"),
    addExpenseFormError: $("addExpenseFormError"),
    toggleExpensePaymentsButton: $("toggleExpensePaymentsButton"),
    expensePaymentsSection: $("expensePaymentsSection"),
    expensePaymentsList: $("expensePaymentsList"),
    expensePaymentsTotal: $("expensePaymentsTotal"),
    addExpenseSplitType: $("addExpenseSplitType"),
    expenseSplitsList: $("expenseSplitsList"),
    expenseSplitsTotal: $("expenseSplitsTotal"),
    inviteModal: $("inviteModal"),
    closeInviteModal: $("closeInviteModal"),
    cancelInviteButton: $("cancelInviteButton"),
    inviteForm: $("inviteForm"),
    inviteEmail: $("inviteEmail"),
    inviteSubmitButton: $("inviteSubmitButton"),
    inviteFormError: $("inviteFormError")
  };

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toggleGroupHeaderActions() {
    if (els.groupHeaderActions) {
      els.groupHeaderActions.hidden =
        !els.groupHeaderActions.hidden;
    }
  }

  function openEditGroupModal() {
    if (!els.editGroupModal) {
      return;
    }

    const group = currentSummary?.group || {};

    els.editGroupName.value =
      group.name || "";

    els.editGroupDescription.value =
      group.description || "";

    if (els.editGroupFormError) {
      els.editGroupFormError.hidden = true;
      els.editGroupFormError.textContent = "";
    }

    els.editGroupModal.hidden = false;

    setTimeout(() => {
      els.editGroupName.focus();
    }, 50);
  }

  function closeEditGroupModalDialog() {
    if (els.editGroupModal) {
      els.editGroupModal.hidden = true;
    }
  }

  async function updateGroup() {
    if (!groupId || !els.editGroupForm) {
      return;
    }

    const payload = {
      name: els.editGroupName.value.trim(),
      description:
        els.editGroupDescription.value.trim()
    };

    if (!payload.name) {
      if (els.editGroupFormError) {
        els.editGroupFormError.textContent =
          "Group name is required.";
        els.editGroupFormError.hidden = false;
      }
      return;
    }

    if (els.editGroupSubmitButton) {
      els.editGroupSubmitButton.disabled = true;
    }

    try {
      const data = await api(
        `/api/ledger/groups/${encodeURIComponent(groupId)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload)
        }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Unable to update group."
        );
      }

      closeEditGroupModalDialog();

      await loadSummary();
    }
    catch (error) {
      console.error(
        "Update group failed:",
        error
      );

      if (els.editGroupFormError) {
        els.editGroupFormError.textContent =
          error.message ||
          "Unable to update group.";

        els.editGroupFormError.hidden = false;
      }
    }
    finally {
      if (els.editGroupSubmitButton) {
        els.editGroupSubmitButton.disabled = false;
      }
    }
  }

  async function deleteGroup() {
    if (!groupId) {
      return;
    }

    const groupName =
      currentSummary?.group?.name ||
      "this group";

    Modal.confirm(
      "Delete",
      `
        <p class="text-slate-600">
          Are you sure you want to delete
          <span class="font-semibold text-slate-800">
            "${escapeHtml(groupName)}"
          </span>
          ?
        </p>
      `,
      async () => {
        const response = await fetch(
          `/api/ledger/groups/${encodeURIComponent(groupId)}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token()}`
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

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Unable to delete group."
          );
        }

        window.location.href =
          "/ledger/sharing.html";
      },
      {
        buttonText: "Delete",
        buttonClass: "bg-red-600",
        loadingText: "Deleting..."
      }
    );
  }

  function money(value) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    ).format(Number(value || 0));
  }

  function initials(name) {
    const words =
      String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
      return "?";
    }

    if (words.length === 1) {
      return words[0]
        .slice(0, 1)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const parts =
      String(value).split("-");

    if (parts.length !== 3) {
      return value;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  async function api(
    path,
    options = {}
  ) {
    const currentToken =
      token();

    if (!currentToken) {
      Auth.logout("/ledger/login.html");
      throw new Error("Not logged in");
    }

    const response =
      await fetch(
        path,
        {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization:
              `Bearer ${currentToken}`,
            "Content-Type":
              "application/json"
          }
        }
      );

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      Auth.logout("/ledger/login.html");
      throw new Error("Session expired");
    }

    let data = {};

    try {
      data =
        await response.json();
    }
    catch (_) {
      data = {};
    }

    if (
      !response.ok ||
      data.success === false
    ) {
      throw new Error(
        data.message ||
        `Request failed (${response.status})`
      );
    }

    return data;
  }

  function showGroupTab(tab) {
    const showMembers = tab === "members";

    els.membersSection.hidden = !showMembers;
    els.expensesSection.hidden = showMembers;

    els.membersTabButton.classList.toggle(
      "selected",
      showMembers
    );
    els.expensesTabButton.classList.toggle(
      "selected",
      !showMembers
    );
  }

  function renderMembers(members) {
    els.membersList.innerHTML = "";

    els.memberCount.textContent =
      `${members.length} ${
        members.length === 1
          ? "member"
          : "members"
      }`;

    for (const member of members) {
      const row =
        document.createElement("div");

      row.className = "party-row";

      const balance =
        Number(member.net_balance || 0);

      let balanceClass =
        "party-balance-zero";

      if (balance > 0) {
        balanceClass =
          "party-balance-give";
      }
      else if (balance < 0) {
        balanceClass =
          "party-balance-get";
      }

      let balanceText =
        "Settled";

      if (balance > 0) {
        balanceText =
          ` ${money(balance)}`;
      }
      else if (balance < 0) {
        balanceText =
          ` ${money(Math.abs(balance))}`;
      }

      row.innerHTML = `
        <span class="party-avatar">
          ${escapeHtml(
            initials(member.name)
          )}
        </span>

        <span class="party-info">
          <span class="party-name">
            ${escapeHtml(
              member.name || "Unnamed"
            )}
          </span>

          <span class="party-mobile">
            ${escapeHtml(
              member.role === "owner"
                ? "Owner"
                : "Member"
            )}
          </span>
        </span>

        <span class="party-balance ${balanceClass}">
          <span class="party-balance-amount">
            ${escapeHtml(balanceText)}
          </span>
        </span>
      `;

      els.membersList.appendChild(row);
    }
  }

  function renderExpenses(expenses) {
    els.expensesList.innerHTML = "";

    els.expenseCount.textContent =
      `${expenses.length} ${
        expenses.length === 1
          ? "expense"
          : "expenses"
      }`;

    els.expensesEmpty.hidden =
      expenses.length !== 0;

    for (const expense of expenses) {
      const row =
        document.createElement("div");

      row.className = "party-row";

      const currentAccountId =

        getAlignAccountId();

      const canEdit =

        Number(expense.added_by_account_id) ===

        Number(currentAccountId);

      if (canEdit) {

        row.classList.add(

          "expense-row-editable"

        );

        row.addEventListener(

          "click",

          () => openEditExpenseModal(expense)

        );

      }
      else {

        row.addEventListener(

          "click",

          () => {

            const addedByName =

              expense.added_by_name ||

              "another member";

            const expenseSplits =

              Array.isArray(currentSummary?.splits)

                ? currentSummary.splits.filter(

                    (split) =>

                      Number(split.expense_id) ===

                      Number(expense.id)

                  )

                : [];

            const members =

              Array.isArray(currentSummary?.members)

                ? currentSummary.members

                : [];

            const splitRows =

              expenseSplits

                .map(

                  (split) => {

                    const member =

                      members.find(

                        (item) =>

                          Number(item.member_id) ===

                          Number(split.member_id)

                      );

                    const memberName =

                      member?.name ||

                      "Member";

                    const shareAmount =

                      Number(split.share_amount || 0)

                        .toFixed(2);

                    return `

                      <div class="flex items-center justify-between gap-3 py-1">

                        <span class="text-slate-600">

                          ${escapeHtml(memberName)}

                        </span>

                        <strong class="text-slate-900">

                          ₹${escapeHtml(shareAmount)}

                        </strong>

                      </div>

                    `;

                  }

                )

                .join("");

            Modal.confirm(

              "Expense Access",

              `

                <p class="text-slate-600">

                  This expense was added by

                  <strong>${escapeHtml(addedByName)}</strong>.

                </p>

                <div class="mt-3">

                  <div class="flex items-center justify-between">

                    <span class="text-slate-500">

                      Total Expense

                    </span>

                    <strong class="text-slate-900">

                      ₹${Number(expense.amount || 0).toFixed(2)}

                    </strong>

                  </div>

                </div>

                <div class="mt-3 border-t pt-3">

                  <p class="mb-2 font-medium text-slate-700">

                    Share

                  </p>

                  ${

                    splitRows ||

                    '<p class="text-sm text-slate-500">No share details available.</p>'

                  }

                </div>

                <p class="mt-3 text-sm text-slate-500">

                  Only ${escapeHtml(addedByName)}

                  can edit or delete this expense.

                </p>

              `,

              () => {}

            );

          }

        );

      }

      row.innerHTML = `
        <span class="party-avatar">
          ₹
        </span>

        <span class="party-info">
          <span class="party-name">
            ${escapeHtml(
              expense.description ||
              "Expense"
            )}
          </span>

          <span class="party-mobile">
            ${escapeHtml(
              formatDate(
                expense.expense_date
              )
            )}
            ·
            ${escapeHtml(
              expense.split_type || "equal"
            )}
          </span>
        </span>

        <span class="party-balance party-balance-zero">
          <span class="party-balance-amount">
            ${escapeHtml(
              money(expense.amount)
            )}
          </span>
        </span>
      `;

      els.expensesList.appendChild(row);
    }
  }

  function renderSummary(summary) {
    const group =
      summary.group || {};

    currentSummary = summary;

    els.groupName.textContent =
      group.name || "Sharing Group";

    els.groupDescription.textContent =
      group.description ||
      "";

    els.totalExpenses.textContent =
      money(summary.total_expenses);

    els.youWillGet.textContent =
      money(summary.you_will_get);

    els.youWillPay.textContent =
      money(summary.you_will_pay);

    els.totalExpenses.closest(".summary-card").hidden =
      Number(summary.total_expenses) <= 0;

    els.youWillGet.closest(".summary-card").hidden =
      Number(summary.you_will_get) <= 0;

    els.youWillPay.closest(".summary-card").hidden =
      Number(summary.you_will_pay) <= 0;

    renderMembers(
      Array.isArray(summary.members)
        ? summary.members
        : []
    );

    renderExpenses(
      Array.isArray(summary.expenses)
        ? summary.expenses
        : []
    );
  }

  if (els.groupHeaderDetails) {
    els.groupHeaderDetails.addEventListener(
      "click",
      (event) => {
        if (
          event.target.closest(
            "#groupHeaderActions"
          )
        ) {
          return;
        }

        toggleGroupHeaderActions();
      }
    );

    els.groupHeaderDetails.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          toggleGroupHeaderActions();
        }
      }
    );
  }

  if (els.editGroupButton) {
    els.editGroupButton.addEventListener(
      "click",
      openEditGroupModal
    );
  }

  if (els.deleteGroupButton) {
    els.deleteGroupButton.addEventListener(
      "click",
      deleteGroup
    );
  }

  if (els.closeEditGroupModal) {
    els.closeEditGroupModal.addEventListener(
      "click",
      closeEditGroupModalDialog
    );
  }

  if (els.cancelEditGroupButton) {
    els.cancelEditGroupButton.addEventListener(
      "click",
      closeEditGroupModalDialog
    );
  }

  if (els.editGroupForm) {
    els.editGroupForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();
        await updateGroup();
      }
    );
  }

  async function loadSummary() {
    if (!groupId) {
      throw new Error(
        "Group ID is missing."
      );
    }

    const data =
      await api(
        `/api/ledger/group-summary/groups/${
          encodeURIComponent(groupId)
        }`
      );

    if (!data.summary) {
      throw new Error(
        "Group summary not found."
      );
    }

    renderSummary(data.summary);
  }

  function getAlignAccountId() {
    const currentToken = token();

    if (!currentToken) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(currentToken.split(".")[1])
      );

      return Number(payload.alignAccountId) || null;
    }
    catch (error) {
      console.error(
        "Unable to read Align account ID:",
        error
      );
      return null;
    }
  }

  function setDefaultExpensePayer() {
    const accountId = getAlignAccountId();
    const amount = getExpenseAmount();

    if (!accountId || amount <= 0) {
      return;
    }

    const member = getExpenseMembers().find(
      (item) => Number(item.account_id) === accountId
    );

    if (!member) {
      return;
    }

    const input = els.expensePaymentsList.querySelector(
      `.expense-payment-input[data-member-id="${member.member_id}"]`
    );

    if (!input) {
      return;
    }

    input.value = formatInputNumber(amount);
    updateExpensePaymentsTotal();
  }

  function toggleExpensePayments() {
    if (!els.expensePaymentsSection) {
      return;
    }

    els.expensePaymentsSection.hidden =
      !els.expensePaymentsSection.hidden;

    els.toggleExpensePaymentsButton.classList.toggle(
      "active",
      !els.expensePaymentsSection.hidden
    );
  }

  function getExpenseMembers() {
    return Array.isArray(currentSummary?.members)
      ? currentSummary.members
      : [];
  }

  function getExpenseAmount() {
    const amount =
      Number(els.addExpenseAmount.value);

    return Number.isFinite(amount) && amount > 0
      ? amount
      : 0;
  }

  function formatInputNumber(value) {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "";
    }

    return number.toFixed(2);
  }

  function renderExpensePayments() {
    const members = getExpenseMembers();

    els.expensePaymentsList.innerHTML = "";

    for (const member of members) {
      const row =
        document.createElement("div");

      row.className =
        "expense-member-row";

      row.innerHTML = `
        <div class="expense-member-info">
          <span class="party-avatar">
            ${escapeHtml(
              initials(member.name)
            )}
          </span>
          <span class="expense-member-name">
            ${escapeHtml(
              member.name || "Unnamed"
            )}
          </span>
        </div>
        <input
          type="number"
          class="expense-payment-input"
          data-member-id="${escapeHtml(
            member.member_id
          )}"
          min="0"
          step="0.01"
          inputmode="decimal"
          placeholder="0.00"
        >
      `;

      els.expensePaymentsList.appendChild(row);
    }

    els.expensePaymentsList
      .querySelectorAll(
        ".expense-payment-input"
      )
      .forEach((input) => {
        input.addEventListener(
          "input",
          updateExpensePaymentsTotal
        );
      });

    updateExpensePaymentsTotal();
  }

  function updateExpensePaymentsTotal() {
    let total = 0;

    els.expensePaymentsList
      .querySelectorAll(
        ".expense-payment-input"
      )
      .forEach((input) => {
        const value =
          Number(input.value || 0);

        if (
          Number.isFinite(value) &&
          value > 0
        ) {
          total += value;
        }
      });

    els.expensePaymentsTotal.textContent =
      money(total);

    const amount =
      getExpenseAmount();

    if (
      amount > 0 &&
      Math.abs(total - amount) > 0.01
    ) {
      els.expensePaymentsTotal.classList.add(
        "expense-total-invalid"
      );
    }
    else {
      els.expensePaymentsTotal.classList.remove(
        "expense-total-invalid"
      );
    }
  }

  function getSplitModeDefaultValue(
    splitType,
    index,
    memberCount
  ) {
    if (splitType === "equal") {
      return memberCount > 0
        ? 100 / memberCount
        : 0;
    }

    if (splitType === "percentage") {
      return memberCount > 0
        ? 100 / memberCount
        : 0;
    }

    if (splitType === "ratio") {
      return 1;
    }

    return 0;
  }

  function renderExpenseSplits() {
    const members = getExpenseMembers();
    const splitType =
      els.addExpenseSplitType.value;

    els.expenseSplitsList.innerHTML = "";

    for (
      let index = 0;
      index < members.length;
      index += 1
    ) {
      const member =
        members[index];

      const row =
        document.createElement("div");

      row.className =
        "expense-member-row";

      const defaultValue =
        getSplitModeDefaultValue(
          splitType,
          index,
          members.length
        );

      let suffix = "";

      if (splitType === "percentage") {
        suffix = "%";
      }
      else if (splitType === "custom") {
        suffix = "₹";
      }

      row.innerHTML = `
        <div class="expense-member-info">
          <span class="party-avatar">
            ${escapeHtml(
              initials(member.name)
            )}
          </span>
          <span class="expense-member-name">
            ${escapeHtml(
              member.name || "Unnamed"
            )}
          </span>
        </div>
        <div class="expense-split-input-wrap">
          <input
            type="number"
            class="expense-split-input"
            data-member-id="${escapeHtml(
              member.member_id
            )}"
            data-split-type="${escapeHtml(
              splitType
            )}"
            min="0"
            step="0.01"
            inputmode="decimal"
            value="${formatInputNumber(
              defaultValue
            )}"
          >
          <span class="expense-split-suffix">
            ${suffix}
          </span>
        </div>
      `;

      els.expenseSplitsList.appendChild(row);
    }

    els.expenseSplitsList
      .querySelectorAll(
        ".expense-split-input"
      )
      .forEach((input) => {
        input.addEventListener(
          "input",
          updateExpenseSplitDisplay
        );
      });

    updateExpenseSplitDisplay();
  }

  function updateExpenseSplitDisplay() {
    const splitType =
      els.addExpenseSplitType.value;

    const amount =
      getExpenseAmount();

    const inputs =
      Array.from(
        els.expenseSplitsList.querySelectorAll(
          ".expense-split-input"
        )
      );

    let total = 0;

    for (const input of inputs) {
      const value =
        Number(input.value || 0);

      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        total += value;
      }
    }

    if (splitType === "equal") {
      const members =
        getExpenseMembers();

      const count =
        members.length;

      if (
        amount > 0 &&
        count > 0
      ) {
        const base =
          Math.floor(
            (amount / count) * 100
          ) / 100;

        const remainder =
          Math.round(
            (amount - base * count) * 100
          ) / 100;

        inputs.forEach(
          (input, index) => {
            let value = base;

            if (index === count - 1) {
              value =
                Math.round(
                  (base + remainder) * 100
                ) / 100;
            }

            input.value =
              formatInputNumber(value);
          }
        );

        total = amount;
      }
    }

    if (splitType === "percentage") {
      els.expenseSplitsTotal.textContent =
        `${total.toFixed(2)}%`;

      if (
        Math.abs(total - 100) > 0.01
      ) {
        els.expenseSplitsTotal.classList.add(
          "expense-total-invalid"
        );
      }
      else {
        els.expenseSplitsTotal.classList.remove(
          "expense-total-invalid"
        );
      }

      return;
    }

    if (splitType === "ratio") {
      els.expenseSplitsTotal.textContent =
        total.toFixed(2);

      els.expenseSplitsTotal.classList.remove(
        "expense-total-invalid"
      );

      return;
    }

    els.expenseSplitsTotal.textContent =
      money(total);

    if (
      amount > 0 &&
      Math.abs(total - amount) > 0.01
    ) {
      els.expenseSplitsTotal.classList.add(
        "expense-total-invalid"
      );
    }
    else {
      els.expenseSplitsTotal.classList.remove(
        "expense-total-invalid"
      );
    }
  }

  function resetExpenseMemberInputs() {
    renderExpensePayments();
    renderExpenseSplits();
  }

  function openAddExpenseModal() {
    if (!els.addExpenseModal) {
      return;
    }

    editingExpenseId = null;
    editingExpense = null;

    if (els.addExpenseModalTitle) {
      els.addExpenseModalTitle.textContent =
        "Add Expense";
    }

    if (els.deleteExpenseButton) {
      els.deleteExpenseButton.hidden = true;
    }

    els.addExpenseForm.reset();

    els.addExpenseFormError.hidden = true;
    els.addExpenseFormError.textContent = "";

    els.addExpenseDate.value =
      new Date().toISOString().slice(0, 10);

    els.addExpenseSplitType.value =
      "equal";

    if (els.expensePaymentsSection) {
      els.expensePaymentsSection.hidden = true;
    }

    if (els.toggleExpensePaymentsButton) {
      els.toggleExpensePaymentsButton.classList.remove("active");
    }

    resetExpenseMemberInputs();

    els.addExpenseModal.hidden = false;

    setTimeout(
      () => els.addExpenseDescription.focus(),
      50
    );
  }

  function closeAddExpenseModal() {
    if (els.addExpenseModal) {
      els.addExpenseModal.hidden = true;
    }

    editingExpenseId = null;
    editingExpense = null;
  }

  async function openEditExpenseModal(expense) {

    if (!expense || !expense.id) {

      return;

    }

    if (

      Number(expense.added_by_account_id) !==

      Number(getAlignAccountId())

    ) {

      return;

    }

    editingExpenseId =

      Number(expense.id);

    editingExpense = expense;

    els.addExpenseForm.reset();

    els.addExpenseFormError.hidden = true;

    els.addExpenseFormError.textContent = "";

    els.addExpenseDescription.value =

      expense.description || "";

    els.addExpenseAmount.value =

      formatInputNumber(expense.amount);

    els.addExpenseDate.value =

      expense.expense_date || "";

    els.addExpenseSplitType.value =

      expense.split_type || "equal";

    if (els.expensePaymentsSection) {

      els.expensePaymentsSection.hidden = true;

    }

    if (els.toggleExpensePaymentsButton) {

      els.toggleExpensePaymentsButton.classList.remove(

        "active"

      );

    }

    resetExpenseMemberInputs();

    try {

      const [splitData, paymentData] =

        await Promise.all([

          api(

            `/api/ledger/group-expense-splits/groups/${encodeURIComponent(groupId)}/expenses/${encodeURIComponent(expense.id)}`

          ),

          api(

            `/api/ledger/group-expense-payments/groups/${encodeURIComponent(groupId)}/expenses/${encodeURIComponent(expense.id)}`

          )

        ]);

      const splits =

        Array.isArray(splitData.splits)

          ? splitData.splits

          : [];

      const payments =

        Array.isArray(paymentData.payments)

          ? paymentData.payments

          : [];

      renderExpensePayments();

      for (const payment of payments) {

        const input =

          els.expensePaymentsList.querySelector(

            `.expense-payment-input[data-member-id="${payment.member_id}"]`

          );

        if (input) {

          input.value =

            formatInputNumber(payment.amount);

        }

      }

      updateExpensePaymentsTotal();

      renderExpenseSplits();

      for (const split of splits) {

        const input =

          els.expenseSplitsList.querySelector(

            `.expense-split-input[data-member-id="${split.member_id}"]`

          );

        if (input) {

          input.value =

            formatInputNumber(split.split_value);

        }

      }

      updateExpenseSplitDisplay();

      if (els.addExpenseModalTitle) {

        els.addExpenseModalTitle.textContent =

          "Edit Expense";

      }

      if (els.deleteExpenseButton) {

        els.deleteExpenseButton.hidden = false;

      }

      if (els.addExpenseSubmitButton) {

        els.addExpenseSubmitButton.textContent =

          "Save Changes";

      }

      els.addExpenseModal.hidden = false;

      setTimeout(

        () => els.addExpenseDescription.focus(),

        50

      );

    }

    catch (error) {

      console.error(

        "Load expense for edit failed:",

        error

      );

      editingExpenseId = null;

      editingExpense = null;

      els.addExpenseFormError.textContent =

        error.message ||

        "Unable to load expense.";

      els.addExpenseFormError.hidden = false;

      els.addExpenseModal.hidden = false;

    }

  }

  function openInviteModal() {
    els.inviteForm.reset();
    els.inviteFormError.hidden = true;
    els.inviteFormError.textContent = "";
    els.inviteModal.hidden = false;

    setTimeout(
      () => els.inviteEmail.focus(),
      50
    );
  }

  function closeInviteModal() {
    els.inviteModal.hidden = true;
  }

  async function sendInvitation(event) {
    event.preventDefault();

    els.inviteFormError.hidden = true;

    const email =
      els.inviteEmail.value
        .trim()
        .toLowerCase();

    if (!email) {
      els.inviteFormError.textContent =
        "Email is required.";
      els.inviteFormError.hidden = false;
      return;
    }

    els.inviteSubmitButton.disabled =
      true;

    try {
      await api(
        `/api/ledger/invitations/groups/${
          encodeURIComponent(groupId)
        }`,
        {
          method: "POST",
          body: JSON.stringify({
            email
          })
        }
      );

      closeInviteModal();

      alert(
        "Invitation sent successfully."
      );
    }
    catch (error) {
      console.error(
        "Send invitation failed:",
        error
      );

      els.inviteFormError.textContent =
        error.message ||
        "Unable to send invitation.";

      els.inviteFormError.hidden = false;
    }
    finally {
      els.inviteSubmitButton.disabled =
        false;
    }
  }

  function getExpensePaymentValues() {
    return Array.from(
      els.expensePaymentsList.querySelectorAll(
        ".expense-payment-input"
      )
    ).map((input) => ({
      member_id: Number(
        input.dataset.memberId
      ),
      amount: Number(
        input.value || 0
      )
    })).filter(
      (payment) =>
        Number.isFinite(payment.amount) &&
        payment.amount > 0
    );
  }

  function getExpenseSplitValues() {
    return Array.from(
      els.expenseSplitsList.querySelectorAll(
        ".expense-split-input"
      )
    ).map((input) => ({
      member_id: Number(
        input.dataset.memberId
      ),
      value: Number(
        input.value || 0
      )
    }));
  }

  function validateExpenseForm() {
    const description =
      els.addExpenseDescription.value.trim();

    const amount =
      getExpenseAmount();

    const expenseDate =
      els.addExpenseDate.value;

    const splitType =
      els.addExpenseSplitType.value;

    if (!description) {
      return "Description is required.";
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return "Enter a valid expense amount.";
    }

    if (!expenseDate) {
      return "Expense date is required.";
    }

    const payments =
      getExpensePaymentValues();

    if (payments.length === 0) {
      return "Enter at least one payer.";
    }

    const paymentTotal =
      payments.reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      );

    if (
      Math.abs(
        paymentTotal - amount
      ) > 0.01
    ) {
      return `Total Paid must equal ${money(amount)}.`;
    }

    const splits =
      getExpenseSplitValues();

    if (splits.length === 0) {
      return "Add at least one split.";
    }

    for (const split of splits) {

      if (

        !Number.isFinite(split.value) ||

        split.value < 0 ||

        (

          splitType === "equal" &&

          split.value <= 0

        )

      ) {

        return "Every member must have a valid split value.";

      }

    }

    if (splitType === "percentage") {
      const percentageTotal =
        splits.reduce(
          (sum, split) =>
            sum + split.value,
          0
        );

      if (
        Math.abs(
          percentageTotal - 100
        ) > 0.01
      ) {
        return "Percentage split must total 100%.";
      }
    }

    if (splitType === "custom") {
      const customTotal =
        splits.reduce(
          (sum, split) =>
            sum + split.value,
          0
        );

      if (
        Math.abs(
          customTotal - amount
        ) > 0.01
      ) {
        return `Custom split must total ${money(amount)}.`;
      }
    }

    if (splitType === "ratio") {
      const ratioTotal =
        splits.reduce(
          (sum, split) =>
            sum + split.value,
          0
        );

      if (ratioTotal <= 0) {
        return "Ratio split must have a valid ratio.";
      }
    }

    return null;
  }

  async function deleteExpense() {
    if (!editingExpenseId) {
      return;
    }

    Modal.confirm(
      "Delete Expense",
      `
        <p class="text-slate-600">
          Are you sure you want to delete this expense?
        </p>
        <p class="mt-2 text-sm text-red-600">
          This action cannot be undone.
        </p>
      `,
      async () => {
        if (els.deleteExpenseButton) {
          els.deleteExpenseButton.disabled = true;
        }

        try {
      await api(
        `/api/ledger/group-expenses/groups/${encodeURIComponent(groupId)}/${encodeURIComponent(editingExpenseId)}`,
        {
          method: "DELETE"
        }
      );

      closeAddExpenseModal();
      await refresh();
        }
        catch (error) {
          console.error(
            "Delete expense failed:",
            error
          );

          els.addExpenseFormError.textContent =
            error.message ||
            "Unable to delete expense.";

          els.addExpenseFormError.hidden = false;
        }
        finally {
          if (els.deleteExpenseButton) {
            els.deleteExpenseButton.disabled = false;
          }
        }
      }
    );
  }


  async function saveExpense(event) {

    event.preventDefault();

    els.addExpenseFormError.hidden =

      true;

    els.addExpenseFormError.textContent =

      "";

    const validationError =

      validateExpenseForm();

    if (validationError) {

      els.addExpenseFormError.textContent =

        validationError;

      els.addExpenseFormError.hidden =

        false;

      return;

    }

    els.addExpenseSubmitButton.disabled =

      true;

    const amount =

      getExpenseAmount();

    const splitType =

      els.addExpenseSplitType.value;

    const payments =

      getExpensePaymentValues();

    const splits =

      getExpenseSplitValues();

    const isEditing =

      Boolean(editingExpenseId);

    let createdExpenseId = null;

    try {

      const expensePayload = {

        description:

          els.addExpenseDescription.value.trim(),

        amount,

        expense_date:

          els.addExpenseDate.value,

        split_type:

          splitType,

        notes:

          isEditing && editingExpense

            ? editingExpense.notes || null

            : null

      };

      let expenseId;

      if (isEditing) {

        const expenseData =

          await api(

            `/api/ledger/group-expenses/groups/${encodeURIComponent(groupId)}/${encodeURIComponent(editingExpenseId)}`,

            {

              method: "PUT",

              body: JSON.stringify(

                expensePayload

              )

            }

          );

        if (

          !expenseData.expense ||

          !expenseData.expense.id

        ) {

          throw new Error(

            "Expense was updated but no expense ID was returned."

          );

        }

        expenseId =

          expenseData.expense.id;

      }

      else {

        const expenseData =

          await api(

            `/api/ledger/group-expenses/groups/${encodeURIComponent(groupId)}`,

            {

              method: "POST",

              body: JSON.stringify(

                expensePayload

              )

            }

          );

        if (

          !expenseData.expense ||

          !expenseData.expense.id

        ) {

          throw new Error(

            "Expense was created but no expense ID was returned."

          );

        }

        expenseId =

          expenseData.expense.id;

        createdExpenseId =

          expenseId;

      }

      await api(

        `/api/ledger/group-expense-splits/groups/${encodeURIComponent(groupId)}/expenses/${encodeURIComponent(expenseId)}`,

        {

          method: "PUT",

          body: JSON.stringify({

            split_type:

              splitType,

            splits

          })

        }

      );

      await api(

        `/api/ledger/group-expense-payments/groups/${encodeURIComponent(groupId)}/expenses/${encodeURIComponent(expenseId)}`,

        {

          method: "PUT",

          body: JSON.stringify({

            payments

          })

        }

      );

      closeAddExpenseModal();

      await refresh();

    }

    catch (error) {

      console.error(

        isEditing

          ? "Edit expense failed:"

          : "Add expense failed:",

        error

      );

      if (createdExpenseId) {

        try {

          await api(

            `/api/ledger/group-expenses/groups/${encodeURIComponent(groupId)}/${encodeURIComponent(createdExpenseId)}`,

            {

              method: "DELETE"

            }

          );

        }

        catch (rollbackError) {

          console.error(

            "Expense rollback failed:",

            rollbackError

          );

        }

      }

      els.addExpenseFormError.textContent =

        error.message ||

        (

          isEditing

            ? "Unable to update expense."

            : "Unable to add expense."

        );

      els.addExpenseFormError.hidden =

        false;

    }

    finally {

      els.addExpenseSubmitButton.disabled =

        false;

    }

  }


  async function refresh() {
    try {
      els.groupLoading.hidden = false;
      els.groupError.hidden = true;
      els.groupDetails.hidden = true;

      await loadSummary();

      els.groupLoading.hidden = true;
      els.groupDetails.hidden = false;
    }
    catch (error) {
      console.error(
        "Group refresh failed:",
        error
      );

      els.groupLoading.hidden = true;
      els.groupError.hidden = false;
      els.groupError.querySelector("p").textContent =
        error.message ||
        "Unable to load group.";
    }
  }

  if (els.toggleExpensePaymentsButton) {
    els.toggleExpensePaymentsButton.addEventListener(
      "click",
      toggleExpensePayments
    );
  }

  if (els.membersTabButton) {
    els.membersTabButton.addEventListener(
      "click",
      () => showGroupTab("members")
    );
  }

  if (els.expensesTabButton) {
    els.expensesTabButton.addEventListener(
      "click",
      () => showGroupTab("expenses")
    );
  }

  if (els.bottomAddMemberButton) {
    els.bottomAddMemberButton.addEventListener(
      "click",
      openInviteModal
    );
  }

  if (els.bottomAddExpenseButton) {
    els.bottomAddExpenseButton.addEventListener(
      "click",
      openAddExpenseModal
    );
  }

  if (els.addExpenseAmount) {
    els.addExpenseAmount.addEventListener(
      "input",
      () => {
        setDefaultExpensePayer();
        updateExpenseSplitDisplay();
      }
    );
  }

  if (els.addExpenseSplitType) {
    els.addExpenseSplitType.addEventListener(
      "change",
      renderExpenseSplits
    );
  }

  if (els.closeAddExpenseModal) {
    els.closeAddExpenseModal.addEventListener(
      "click",
      closeAddExpenseModal
    );
  }

  if (els.cancelAddExpenseButton) {
    els.cancelAddExpenseButton.addEventListener(
      "click",
      closeAddExpenseModal
    );
  }

  if (els.deleteExpenseButton) {
    els.deleteExpenseButton.addEventListener(
      "click",
      deleteExpense
    );
  }

  els.closeInviteModal.addEventListener(
    "click",
    closeInviteModal
  );

  els.cancelInviteButton.addEventListener(
    "click",
    closeInviteModal
  );

  els.inviteModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        els.inviteModal
      ) {
        closeInviteModal();
      }
    }
  );

  els.inviteForm.addEventListener(
    "submit",
    sendInvitation
  );

  if (els.addExpenseForm) {
    els.addExpenseForm.addEventListener(
      "submit",
      saveExpense
    );
  }

  refresh();
})();
