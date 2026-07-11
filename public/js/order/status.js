function renderItemStatus(item) {

    let html = "";

    if ((item.pending_count || 0) > 0) {

        html += `
<div class="mt-1 text-xs font-medium text-orange-600">
🟠 Pending
</div>
`;
    }

    if ((item.preparing_count || 0) > 0) {

        html += `
<div class="text-xs font-medium text-yellow-600">
🟡 Preparing
</div>
`;
    }

    if ((item.ready_count || 0) > 0) {

        html += `
<div class="text-xs font-medium text-green-600">
🟢 Ready
</div>
`;
    }

    if ((item.cancelled_count || 0) > 0) {

    html += `
<div class="text-xs font-medium text-red-600">
🔴 Cancelled
</div>
`;

}

if ((item.served_count || 0) > 0) {

    html += `
<div class="text-xs font-medium text-blue-600">
🔵 Served
</div>
`;

}

    return html;

}

function canCancelItem(item) {

    return (

        (item.pending_count || 0) > 0 ||

        (item.preparing_count || 0) > 0 ||

        (item.ready_count || 0) > 0

    );

}
async function cancelOrderItem(ticketItemId) {

    Modal.confirm(

        "Cancel Item",

        "Are you sure you want to cancel this item?",

        async () => {

            const data =
                await API.patch(
                    `/api/kitchen/admin/items/${ticketItemId}/cancel`
                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Item Cancelled",
                "success"
            );

            await loadExistingOrder();

            renderCart();

        },

        {

            buttonText: "Cancel Item",

            buttonClass: "bg-red-600",

            loadingText: "Cancelling..."

        }

    );

}
function canServeItem(item) {

    return (item.ready_count || 0) > 0;

}
async function serveOrderItem(ticketItemId) {

    Modal.confirm(

        "Serve Item",

        "Mark this item as served?",

        async () => {

            const data =
                await API.patch(

                    `/api/kitchen/items/${ticketItemId}/status`,

                    {
                        status: "served"
                    }

                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Item Served",
                "success"
            );

            await loadExistingOrder();

            renderCart();
            
            

        },

        {

            buttonText: "Serve",

            buttonClass: "bg-green-600",

            loadingText: "Serving..."

        }

    );

}