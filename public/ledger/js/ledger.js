(() => {
  "use strict";

  if (window.Auth && typeof Auth.requireLogin === "function") {
    Auth.requireLogin();
  }

  const token = () => localStorage.getItem("token");

  const state = {
    business: null,
    parties: [],
    search: ""
  };

  const $ = (id) => document.getElementById(id);

  const els = {
    businessName: $("businessName"),
    selectedBookName: $("selectedBookName"),
    bookMenu: $("bookMenu"),
    ledgerBookButton: $("ledgerBookButton"),
    createBookButton: $("createBookButton"),

    receivableAmount: $("receivableAmount"),
    payableAmount: $("payableAmount"),

    reportsButton: $("reportsButton"),
    partySearch: $("partySearch"),
    clearSearch: $("clearSearch"),

    partyCountText: $("partyCountText"),
    partiesList: $("partiesList"),
    emptyState: $("emptyState"),
    noSearchResults: $("noSearchResults"),
    refreshButton: $("refreshButton"),

    addPartyButton: $("addPartyButton"),
    emptyAddPartyButton: $("emptyAddPartyButton"),

    partyModal: $("partyModal"),
    closePartyModal: $("closePartyModal"),
    cancelPartyButton: $("cancelPartyButton"),
    partyForm: $("partyForm"),
    partyName: $("partyName"),
    partyMobile: $("partyMobile"),
    partyAddress: $("partyAddress"),
    partyFormError: $("partyFormError")
  };

  function money(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  function getPartyName(party) {
    return party.name || party.party_name || "Unnamed Party";
  }

  function getPartyMobile(party) {
    return party.mobile || party.phone || "";
  }

  function getPartyBalance(party) {
    return Number(
      party.balance ??
      party.current_balance ??
      party.outstanding_balance ??
      0
    );
  }

  async function api(path, options = {}) {
    const currentToken = token();

    if (!currentToken) {
      if (window.Auth && typeof Auth.logout === "function") {
        Auth.logout();
      } else {
        window.location.href = "/login.html";
      }
      throw new Error("Not logged in");
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      if (window.Auth && typeof Auth.logout === "function") {
        Auth.logout();
      } else {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      }
      throw new Error("Session expired");
    }

    let data = null;

    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  }

  async function loadBusiness() {
  const data = await api("/api/ledger/business");
  state.business = data.business || null;

  if (state.business) {
    const name =
      state.business.business_name ||
      state.business.businessName ||
      "Ledger";

    els.businessName.textContent = name;
    els.selectedBookName.textContent = name;

    const activeBook = document.querySelector(".book-option.active span:first-child");
    if (activeBook) {
      activeBook.textContent = name;
    }
  }
}

  async function loadParties() {
    const data = await api("/api/ledger/parties");

    state.parties = Array.isArray(data)
      ? data
      : Array.isArray(data.parties)
        ? data.parties
        : Array.isArray(data.data)
          ? data.data
          : [];

    render();
  }

  function calculateSummary() {
    let receivable = 0;
    let payable = 0;

    for (const party of state.parties) {
      const balance = getPartyBalance(party);

      if (balance > 0) {
        receivable += balance;
      } else if (balance < 0) {
        payable += Math.abs(balance);
      }
    }

    els.receivableAmount.textContent = money(receivable);
    els.payableAmount.textContent = money(payable);
  }

  function filteredParties() {
    const query = state.search.trim().toLowerCase();

    if (!query) {
      return state.parties;
    }

    return state.parties.filter((party) => {
      const name = getPartyName(party).toLowerCase();
      const mobile = getPartyMobile(party).toLowerCase();

      return name.includes(query) || mobile.includes(query);
    });
  }

  function initials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (!words.length) return "?";
    if (words.length === 1) return words[0].slice(0, 1).toUpperCase();

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  function renderParties() {
    const visible = filteredParties();

    els.partiesList.innerHTML = "";

    if (state.parties.length === 0) {
      els.emptyState.hidden = false;
      els.noSearchResults.hidden = true;
      return;
    }

    els.emptyState.hidden = true;

    if (visible.length === 0) {
      els.noSearchResults.hidden = false;
      return;
    }

    els.noSearchResults.hidden = true;

    for (const party of visible) {
      const name = getPartyName(party);
      const mobile = getPartyMobile(party);
      const balance = getPartyBalance(party);

      const row = document.createElement("button");
      row.type = "button";
      row.className = "party-row";

      row.innerHTML = `
        <span class="party-avatar">${escapeHtml(initials(name))}</span>
        <span class="party-info">
          <span class="party-name">${escapeHtml(name)}</span>
          <span class="party-mobile">${escapeHtml(mobile || "No mobile number")}</span>
        </span>
        <span class="party-balance">
          <span class="party-balance-amount">${escapeHtml(money(Math.abs(balance)))}</span>
          <span class="party-balance-label">${
            balance > 0 ? "You will get" :
            balance < 0 ? "You will give" :
            "No balance"
          }</span>
        </span>
      `;

      // Party detail is intentionally not implemented in this phase.
      row.addEventListener("click", () => {});

      els.partiesList.appendChild(row);
    }
  }

  function render() {
    const count = state.parties.length;
    els.partyCountText.textContent =
      `${count} ${count === 1 ? "party" : "parties"}`;

    calculateSummary();
    renderParties();

    els.clearSearch.hidden = !state.search;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function refresh() {
    els.refreshButton.disabled = true;

    try {
      await Promise.all([
        loadBusiness(),
        loadParties()
      ]);
    } catch (error) {
      console.error("Ledger refresh failed:", error);
      alert(error.message || "Unable to load ledger.");
    } finally {
      els.refreshButton.disabled = false;
    }
  }

  function openPartyModal() {
    els.partyForm.reset();
    els.partyFormError.hidden = true;
    els.partyModal.hidden = false;
    setTimeout(() => els.partyName.focus(), 50);
  }

  function closePartyModal() {
    els.partyModal.hidden = true;
  }

  async function saveParty(event) {
    event.preventDefault();

    els.partyFormError.hidden = true;

    const payload = {
      name: els.partyName.value.trim(),
      mobile: els.partyMobile.value.trim(),
      address: els.partyAddress.value.trim()
    };

    if (!payload.name) {
      els.partyFormError.textContent = "Party name is required.";
      els.partyFormError.hidden = false;
      return;
    }

    const submitButton = els.partyForm.querySelector(".primary-button");
    submitButton.disabled = true;

    try {
      await api("/api/ledger/parties", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      closePartyModal();
      await loadParties();
    } catch (error) {
      console.error("Add party failed:", error);
      els.partyFormError.textContent =
        error.message || "Unable to add party.";
      els.partyFormError.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  }

  function setupEvents() {
    els.ledgerBookButton.addEventListener("click", (event) => {
      event.stopPropagation();
      els.bookMenu.hidden = !els.bookMenu.hidden;
    });

    document.addEventListener("click", () => {
      els.bookMenu.hidden = true;
    });

    els.bookMenu.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    els.createBookButton.addEventListener("click", () => {
      alert("Create new Ledger will be enabled in a later phase.");
    });

    els.reportsButton.addEventListener("click", () => {
      alert("Reports will be enabled in a later phase.");
    });

    els.partySearch.addEventListener("input", () => {
      state.search = els.partySearch.value;
      renderParties();
      els.clearSearch.hidden = !state.search;
    });

    els.clearSearch.addEventListener("click", () => {
      els.partySearch.value = "";
      state.search = "";
      render();
      els.partySearch.focus();
    });

    els.refreshButton.addEventListener("click", refresh);

    els.addPartyButton.addEventListener("click", openPartyModal);
    els.emptyAddPartyButton.addEventListener("click", openPartyModal);

    els.closePartyModal.addEventListener("click", closePartyModal);
    els.cancelPartyButton.addEventListener("click", closePartyModal);
    els.partyForm.addEventListener("submit", saveParty);

    els.partyModal.addEventListener("click", (event) => {
      if (event.target === els.partyModal) {
        closePartyModal();
      }
    });

    document.querySelectorAll(".nav-item").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.nav === "sharing") {
          alert("Sharing will be completed in a later phase.");
        }
      });
    });
  }

  setupEvents();
  refresh();
})();
