async function reserveTable(
    tableId
) {

    Modal.open(

        "Reserve Table",

        `
<div>

<label class="mb-2 block text-sm font-medium">

Customer Name

</label>

<input
    id="reservedName"
    type="text"
    class="w-full rounded-lg border border-slate-300 px-3 py-2"
    placeholder="Enter customer name"
    maxlength="100"
>

</div>
`,

        async () => {

            const reservedName =
                document
                    .getElementById(
                        "reservedName"
                    )
                    .value
                    .trim();

            if (!reservedName) {

                Toast.show(
                    "Customer name is required",
                    "error"
                );

                return;

            }

            const response =
                await API.put(

                    `/api/tables/${tableId}/reserve`,

                    {

                        reserved_name:
                            reservedName

                    }

                );

            if (!response.success) {

                Toast.show(
                    response.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                response.message,
                "success"
            );

            if (typeof window.refreshReservationView === "function") {

    await window.refreshReservationView();

}

        }

    );

}
async function clearReservation(
    tableId
) {

    Modal.confirm(

        "Clear Reservation",

        "Are you sure you want to clear this reservation?",

        async () => {

            const response =
                await API.put(

                    `/api/tables/${tableId}/clear-reservation`

                );

            if (!response.success) {

                Toast.show(
                    response.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                response.message,
                "success"
            );

            if (typeof window.refreshReservationView === "function") {

    await window.refreshReservationView();

}

        }

    );

}