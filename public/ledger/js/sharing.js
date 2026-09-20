localStorage.setItem("ledgerLastPage", "/ledger/sharing.html");
(() => {
  "use strict";

  Auth.requireLogin("/ledger/login.html");

  const token =
    () => localStorage.getItem("token");

  const $ =
    (id) => document.getElementById(id);

  const els = {
    sharingLoading: $("sharingLoading"),
    sharingError: $("sharingError"),
    invitationsSection: $("invitationsSection"),
    invitationsList: $("invitationsList"),
    groupsSection: $("groupsSection"),
    groupsList: $("groupsList"),
    groupsEmptyState: $("groupsEmptyState"),
    headerAddGroupButton: $("headerAddGroupButton"),
    headerGroupsButton: $("headerGroupsButton"),
    emptyCreateGroupButton: $("emptyCreateGroupButton"),
    createGroupModal: $("createGroupModal"),
    closeCreateGroupModal: $("closeCreateGroupModal"),
    cancelCreateGroupButton: $("cancelCreateGroupButton"),
    createGroupForm: $("createGroupForm"),
    groupName: $("groupName"),
    groupDescription: $("groupDescription"),
    createGroupSubmitButton: $("createGroupSubmitButton"),
    createGroupFormError: $("createGroupFormError")
  };

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

  function money(value) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    ).format(
      Number(value || 0)
    );
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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

  function groupTypeIcon(groupType) {
    const icons = {
      "Trip / Travel": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M10.2 3.8l2.1-.7 1.2 5.1 5.2 1.7c.6.2 1 .8.8 1.4l-.2.6-5.9-.9-1.4 5.2 2.1 1.4-.3.9-3.4-1.2-3.4 1.2-.3-.9 2.1-1.4-1.4-5.2-5.9.9-.2-.6c-.2-.6.2-1.2.8-1.4l5.2-1.7 1.2-5.1 1.7.7z"/>
        </svg>
      `,
      "Friends": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="8" r="3"/>
          <circle cx="17" cy="9" r="2.5"/>
          <path d="M3.5 19c.5-3.1 2.4-5 5.5-5s5 1.9 5.5 5"/>
          <path d="M14.5 15c2.5-.5 5 .8 6 3"/>
        </svg>
      `,
      "Family": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="7" r="2.5"/>
          <circle cx="16" cy="7" r="2.5"/>
          <circle cx="12" cy="5" r="2.2"/>
          <path d="M3.5 18c.4-2.7 2-4.5 4.5-4.5S12.1 15.3 12.5 18"/>
          <path d="M11.5 18c.4-2.7 2-4.5 4.5-4.5s4.1 1.8 4.5 4.5"/>
        </svg>
      `,
      "Roommates": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 20V9.5L12 4l8.5 5.5V20"/>
          <path d="M7 20v-6h10v6"/>
          <path d="M9.5 11h5"/>
        </svg>
      `,
      "Couples": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 8.8 2.5z"/>
        </svg>
      `,
      "Office / Work": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3.5" y="7" width="17" height="13" rx="2"/>
          <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/>
          <path d="M3.5 12h17"/>
          <path d="M10 12v2h4v-2"/>
        </svg>
      `,
      "Event / Party": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="5" width="16" height="15" rx="2"/>
          <path d="M8 3v4M16 3v4M4 9h16"/>
          <path d="M12 12l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"/>
        </svg>
      `,
      "Business": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="3.5" width="16" height="17" rx="2"/>
          <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M11 20.5v-4h2v4"/>
        </svg>
      `,
      "Other": `
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5z"/>
          <path d="M8 9.5l4 2.3 4-2.3"/>
          <path d="M12 12v4.5"/>
        </svg>
      `
    };

    return (
      icons[groupType] ||
      icons["Other"]
    );
  }

  function openCreateGroupModal() {
    els.createGroupForm.reset();
    els.createGroupFormError.hidden = true;
    els.createGroupFormError.textContent = "";
    els.createGroupModal.hidden = false;

    setTimeout(
      () => els.groupName.focus(),
      50
    );
  }

  function closeCreateGroupModal() {
    els.createGroupModal.hidden = true;
  }

  function groupBalanceStatus(netBalance) {
  const balance =
    Number(netBalance || 0);

  if (balance > 0) {
    return `You will get ₹${balance.toFixed(2)}`;
  }

  if (balance < 0) {
    return `You will pay ₹${Math.abs(balance).toFixed(2)}`;
  }

  return "Settled";
}

function renderGroups(groups) {
    els.groupsList.innerHTML = "";

    if (!groups.length) {
      els.groupsEmptyState.hidden = false;
      return;
    }

    els.groupsEmptyState.hidden = true;

    for (const group of groups) {
      const row =
        document.createElement("button");

      row.type = "button";
      row.className = "party-row";

      row.innerHTML = `
        <span class="party-avatar">
          ${groupTypeIcon(
            group.group_description
          )}
        </span>

        <span class="party-info">
          <span class="party-name">
            ${escapeHtml(
              group.group_name || "Unnamed Group"
            )}
          </span>

          <span class="party-mobile">
            ${escapeHtml(
              groupBalanceStatus(
                group.net_balance
              )
            )}
          </span>
        </span>

        <span class="party-balance party-balance-zero">
          <span class="party-balance-amount">›</span>
        </span>
      `;

      row.addEventListener(
        "click",
        () => {
          window.location.href =
            `/ledger/sharing-group.html?id=${
              encodeURIComponent(group.group_id)
            }`;
        }
      );

      els.groupsList.appendChild(row);
    }
  }

  function renderInvitations(invitations) {
    els.invitationsList.innerHTML = "";

    if (!invitations.length) {
      els.invitationsSection.hidden = true;
      return;
    }

    els.invitationsSection.hidden = false;

    for (const invitation of invitations) {
      const row =
        document.createElement("div");

      row.className = "party-row";

      row.innerHTML = `
        <span class="party-avatar">
          ${escapeHtml(
            initials(
              invitation.group_name
            )
          )}
        </span>

        <span class="party-info">
          <span class="party-name">
            ${escapeHtml(
              invitation.group_name
            )}
          </span>

          <span class="party-mobile">
            Invited by ${
              escapeHtml(
                invitation.inviter_name ||
                "Group member"
              )
            }
          </span>
        </span>

        <span class="party-header-actions">
          <button
            type="button"
            class="secondary-button"
            data-action="reject"
          >
            Reject
          </button>

          <button
            type="button"
            class="secondary-button"
            data-action="accept"
          >
            Accept
          </button>
        </span>
      `;

      row
        .querySelector(
          '[data-action="accept"]'
        )
        .addEventListener(
          "click",
          () => respondToInvitation(
            invitation.id,
            "accepted"
          )
        );

      row
        .querySelector(
          '[data-action="reject"]'
        )
        .addEventListener(
          "click",
          () => respondToInvitation(
            invitation.id,
            "rejected"
          )
        );

      els.invitationsList.appendChild(row);
    }
  }

  async function loadGroups() {
    const data =
      await api(
        "/api/ledger/groups"
      );

    renderGroups(
      Array.isArray(data.groups)
        ? data.groups
        : []
    );
  }

  async function loadInvitations() {
    const data =
      await api(
        "/api/ledger/invitations"
      );

    renderInvitations(
      Array.isArray(data.invitations)
        ? data.invitations
        : []
    );
  }

  async function respondToInvitation(
    invitationId,
    status
  ) {
    try {
      await api(
        `/api/ledger/invitations/${
          encodeURIComponent(
            invitationId
          )
        }/respond`,
        {
          method: "PUT",
          body: JSON.stringify({
            status
          })
        }
      );

      await Promise.all([
        loadGroups(),
        loadInvitations()
      ]);
    }
    catch (error) {
      console.error(
        "Invitation response failed:",
        error
      );

      alert(
        error.message ||
        "Unable to respond to invitation."
      );
    }
  }

  async function createGroup(event) {
    event.preventDefault();

    els.createGroupFormError.hidden = true;

    const payload = {
      name:
        els.groupName.value.trim(),
      description:
        els.groupDescription.value.trim()
    };

    if (!payload.name) {
      els.createGroupFormError.textContent =
        "Group name is required.";
      els.createGroupFormError.hidden = false;
      return;
    }

    els.createGroupSubmitButton.disabled = true;

    try {
      const data =
        await api(
          "/api/ledger/groups",
          {
            method: "POST",
            body: JSON.stringify(payload)
          }
        );

      closeCreateGroupModal();

      if (data.group?.id) {
        window.location.href =
          `/ledger/sharing-group.html?id=${
            encodeURIComponent(
              data.group.id
            )
          }`;
        return;
      }

      await loadGroups();
    }
    catch (error) {
      console.error(
        "Create group failed:",
        error
      );

      els.createGroupFormError.textContent =
        error.message ||
        "Unable to create group.";

      els.createGroupFormError.hidden = false;
    }
    finally {
      els.createGroupSubmitButton.disabled =
        false;
    }
  }

  async function refresh() {
    try {
      els.sharingLoading.hidden = false;
      els.sharingError.hidden = true;

      await Promise.all([
        loadGroups(),
        loadInvitations()
      ]);

      els.groupsSection.hidden = false;
      els.sharingLoading.hidden = true;
    }
    catch (error) {
      console.error(
        "Sharing refresh failed:",
        error
      );

      els.sharingLoading.hidden = true;
      els.sharingError.hidden = false;
      els.sharingError.querySelector("p").textContent =
        error.message ||
        "Unable to load sharing.";
    }
  }

  els.emptyCreateGroupButton.addEventListener(
    "click",
    openCreateGroupModal
  );

  els.headerAddGroupButton.addEventListener(
    "click",
    openCreateGroupModal
  );

  els.headerGroupsButton.addEventListener(
    "click",
    openCreateGroupModal
  );

  els.closeCreateGroupModal.addEventListener(
    "click",
    closeCreateGroupModal
  );

  els.cancelCreateGroupButton.addEventListener(
    "click",
    closeCreateGroupModal
  );

  els.createGroupModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        els.createGroupModal
      ) {
        closeCreateGroupModal();
      }
    }
  );

  els.createGroupForm.addEventListener(
    "submit",
    createGroup
  );

  refresh();
})();
