const Toast = {

    show(message, type = "success") {

        const toast = document.createElement("div");

        toast.className =
            `fixed top-5 right-5 z-50 rounded-lg px-5 py-3 text-white shadow-lg transition-all`;

        if (type === "success") {
            toast.classList.add("bg-green-600");
        } else {
            toast.classList.add("bg-red-600");
        }

        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {

            toast.remove();

        }, 3000);

    }

};