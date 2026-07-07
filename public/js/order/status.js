function renderItemStatus(item) {

    let html = "";

    if ((item.pending_count || 0) > 0) {

        html += `
<div class="mt-1 text-xs font-medium text-orange-600">
🟠 Pending : ${item.pending_count}
</div>
`;
    }

    if ((item.preparing_count || 0) > 0) {

        html += `
<div class="text-xs font-medium text-yellow-600">
🟡 Preparing : ${item.preparing_count}
</div>
`;
    }

    if ((item.ready_count || 0) > 0) {

        html += `
<div class="text-xs font-medium text-green-600">
🟢 Ready : ${item.ready_count}
</div>
`;
    }

    if ((item.cancelled_count || 0) > 0) {

    html += `
<div class="text-xs font-medium text-red-600">
🔴 Cancelled : ${item.cancelled_count}
</div>
`;

}

if ((item.served_count || 0) > 0) {

    html += `
<div class="text-xs font-medium text-blue-600">
🔵 Served : ${item.served_count}
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

    Toast.show(
        "Item Cancelled",
        "success"
    );

    await loadExistingOrder();

    renderCart();

}
function canServeItem(item) {

    return (item.ready_count || 0) > 0;

}
async function serveOrderItem(ticketItemId) {

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

    Toast.show(
        "Item Served",
        "success"
    );

    await loadExistingOrder();

    renderCart();

}