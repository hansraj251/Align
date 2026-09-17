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
    groupCountText: $("groupCountText"),
    groupsList: $("groupsList"),
    groupsEmptyState: $("groupsEmptyState"),
    bottomAddGroupButton: $("bottomAddGroupButton"),
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

  function renderGroups(groups) {
    els.groupsList.innerHTML = "";

    els.groupCountText.textContent =
      `${groups.length} ${
        groups.length === 1
          ? "group"
          : "groups"
      }`;

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
          ${escapeHtml(
            initials(group.group_name)
          )}
        </span>

        <span class="party-info">
          <span class="party-name">
            ${escapeHtml(
              group.group_name || "Unnamed Group"
            )}
          </span>

          ${
            group.group_description
              ? `<span class="party-mobile">${escapeHtml(
                  group.group_description
                )}</span>`
              : ""
          }
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

  els.bottomAddGroupButton.addEventListener(
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
