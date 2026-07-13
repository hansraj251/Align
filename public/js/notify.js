const Notify = {

    show(
        message,
        type = "success"
    ) {

        let toast =
            document.getElementById(
                "notifyToast"
            );

        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id =
                "notifyToast";

            toast.className =
                "fixed right-6 top-6 z-[9999] hidden max-w-sm rounded-xl px-5 py-4 text-white shadow-2xl transition-all duration-300";

            document.body.appendChild(
                toast
            );

        }

        toast.textContent =
            message;

        toast.classList.remove(

            "hidden",

            "bg-green-600",

            "bg-red-600",

            "bg-blue-600"

        );

        switch (type) {

            case "error":

                toast.classList.add(
                    "bg-red-600"
                );

                break;

            case "info":

                toast.classList.add(
                    "bg-blue-600"
                );

                break;

            default:

                toast.classList.add(
                    "bg-green-600"
                );

        }

        toast.style.opacity = "1";
        toast.style.transform =
            "translateY(0)";

        clearTimeout(
            toast.timer
        );

        toast.timer =
            setTimeout(() => {

                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateY(-12px)";

                setTimeout(() => {

                    toast.classList.add(
                        "hidden"
                    );

                }, 300);

            }, 2500);

    },

    success(message) {

        this.show(
            message,
            "success"
        );

    },

    error(message) {

        this.show(
            message,
            "error"
        );

    },

    info(message) {

        this.show(
            message,
            "info"
        );

    }

};