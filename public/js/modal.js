const Modal = {

    open(
    title,
    bodyHtml,
    onSave,
    options = {}
) {

    document
        .getElementById("modalTitle")
        .textContent = title;

    document
        .getElementById("modalBody")
        .innerHTML = bodyHtml;

    const overlay =
        document.getElementById(
            "modalOverlay"
        );

    overlay.classList.remove("hidden");

    overlay.classList.add("flex");

    const saveBtn =
        document.getElementById(
            "modalSave"
        );

    saveBtn.textContent =
        options.buttonText || "Save";

    saveBtn.className =
        `rounded-lg px-5 py-2 text-white ${
            options.buttonClass ||
            "bg-blue-600"
        }`;

    saveBtn.onclick = onSave;

},

    close() {

        const overlay =
            document.getElementById(
                "modalOverlay"
            );

        overlay.classList.add(
            "hidden"
        );

        overlay.classList.remove(
            "flex"
        );

    }

};

document.addEventListener(
    "click",
    e => {

        if (
            e.target.id ===
            "modalCancel"
        ) {

            Modal.close();

        }

    }
);
Modal.confirm = function (
    title,
    message,
    onConfirm
) {

    Modal.open(

        title,

        `
<p class="text-slate-600">

${message}

</p>
`,

        onConfirm,

        {
            buttonText: "Delete",
            buttonClass: "bg-red-600"
        }

    );

};
