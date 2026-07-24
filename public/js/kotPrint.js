const params =
    new URLSearchParams(
        window.location.search
    );

const ticketId =
    params.get("ticket");

document.addEventListener(
    "DOMContentLoaded",
    init
);

async function init() {

    if (!ticketId) {

        return;

    }

    const response =
        await API.get(
            `/api/kitchen/tickets/${ticketId}/print`
        );

    if (!response.success) {

        return;

    }
console.log(response);
console.log(
    JSON.stringify(
        response,
        null,
        2
    )
);
console.log(Array.isArray(response.ticket.items));
    renderTicket(
        response.ticket
    );

    setTimeout(
        () => {

            window.print();

        },
        300
    );

}

function renderTicket(
    ticket
) {

    const container =
        document.getElementById(
            "kotContent"
        );

    container.innerHTML =
        `
       <div class="text-center">

    <h2 class="text-xl font-bold">
        KOT
    </h2>

    <p>
        KOT #${ticket.ticket_number || ticket.ticket_id}
    </p>

    ${
        ticket.area_name === "Take Away"
            ? `
                <p>
                    ${ticket.table_name}
                </p>
            `
            : `
                <p>
                    ${ticket.area_name}
                </p>

                <p>
                    Table :
                    ${ticket.table_name}
                </p>
            `
    }

    <hr class="my-3">

</div>

        ${ticket.items.map(
            item => `
                <div class="flex justify-between py-1">

                    <div>

                        <div>
                            ${item.name}
                        </div>

                        ${
                            item.variant_name
                                ? `
                                    <div class="text-xs">
                                        ${item.variant_name}
                                    </div>
                                `
                                : ""
                        }

                        ${
                            item.notes
                                ? `
                                    <div class="text-xs italic">
                                        ${item.notes}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                    <div>
                        x${item.quantity}
                    </div>

                </div>
            `
        ).join("")}
        `;

}
window.addEventListener(
    "afterprint",
    () => {

        window.close();

    }
);