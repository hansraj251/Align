const reportRepository =
    require("../repositories/reportRepository");
const ExcelJS =
    require("exceljs");
exports.getReport = async (

    restaurantId,

    type,

    from,

    to

) => {

    switch (type) {

        case "sales":

            return await reportRepository.getSalesSummary(

                restaurantId,

                from,

                to

            );

        case "orders":

            return await reportRepository.getOrdersReport(

                restaurantId,

                from,

                to

            );

        case "items":

            return await reportRepository.getItemsReport(

                restaurantId,

                from,

                to

            );

        case "payments":

            return await reportRepository.getPaymentsReport(

                restaurantId,

                from,

                to

            );

        case "audit":

            return await reportRepository.getAuditReport(

                restaurantId,

                from,

                to

            );

        default:

            throw new Error(
                "Invalid report type"
            );

    }

};
exports.downloadExcel = async (
    restaurantId,
    from,
    to,
    res
) => {

    const workbook =
        new ExcelJS.Workbook();

    workbook.creator =
        "Align POS";

    workbook.created =
        new Date();

    workbook.title =
        "Restaurant Report";


    const sales =
    await reportRepository.getSalesSummary(

        restaurantId,

        from,

        to

    );

    // Sales Sheet
    const salesSheet =
    workbook.addWorksheet(
        "Sales Summary"
    );
    salesSheet.columns = [

    {
        header: "Metric",
        key: "metric",
        width: 30
    },

    {
        header: "Value",
        key: "value",
        width: 25
    }

];
salesSheet.addRows([

    {

        metric: "Total Orders",

        value: sales.total_orders

    },

    {

        metric: "Gross Sales",

        value: sales.gross_sales

    },

    {

        metric: "Discount",

        value: sales.total_discount

    },

    {

        metric: "Tax",

        value: sales.total_tax

    },

    {

        metric: "Net Sales",

        value: sales.net_sales

    },

    {

        metric: "Average Bill",

        value: sales.average_bill

    }

]);
salesSheet.getRow(1).font = {

    bold: true,

    color: {

        argb: "FFFFFFFF"

    }

};

salesSheet.getRow(1).fill = {

    type: "pattern",

    pattern: "solid",

    fgColor: {

        argb: "1E3A8A"

    }

};
for (

    let i = 3;

    i <= 7;

    i++

) {

    salesSheet.getCell(

        `B${i}`

    ).numFmt =

        '₹#,##0.00';

}
salesSheet.getCell(

    "B8"

).numFmt =

'₹#,##0.00';
salesSheet.autoFilter = {

    from: "A1",

    to: "B7"

};
salesSheet.views = [

    {

        state: "frozen",

        ySplit: 1

    }

];

  const orders =
    await reportRepository.getOrdersReport(

        restaurantId,

        from,

        to

    );
    const orderSheet =
    workbook.addWorksheet(
        "Orders"
    );
    orderSheet.columns = [

    {
        header: "Order No",
        key: "order_number",
        width: 15
    },

    {
        header: "Table",
        key: "table_name",
        width: 15
    },

    {
        header: "Payment",
        key: "payment_method",
        width: 15
    },

    {
        header: "Subtotal",
        key: "subtotal",
        width: 15
    },

    {
        header: "Discount",
        key: "discount",
        width: 15
    },

    {
        header: "Tax",
        key: "tax",
        width: 15
    },

    {
        header: "Total",
        key: "total",
        width: 15
    },

    {
        header: "Status",
        key: "status",
        width: 15
    },

    {
        header: "Paid At",
        key: "paid_at",
        width: 22
    }

];
orders.forEach(order => {

    orderSheet.addRow({

        order_number:
            order.order_number,

        table_name:
            order.table_name,

        payment_method:
            order.payment_method,

        subtotal:
            order.subtotal,

        discount:
            order.discount,

        tax:
            order.tax,

        total:
            order.total,

        status:
            order.status,

        paid_at:
            order.paid_at

    });

});
orderSheet.getRow(1).font = {

    bold: true,

    color: {

        argb: "FFFFFFFF"

    }

};

orderSheet.getRow(1).fill = {

    type: "pattern",

    pattern: "solid",

    fgColor: {

        argb: "1E3A8A"

    }

};
for (

    let i = 2;

    i <= orderSheet.rowCount;

    i++

) {

    ["D","E","F","G"].forEach(col => {

        orderSheet.getCell(

            `${col}${i}`

        ).numFmt =

        '₹#,##0.00';

    });

}
orderSheet.views = [

    {

        state: "frozen",

        ySplit: 1

    }

];
orderSheet.autoFilter = {

    from: "A1",

    to: "I1"

};

const items =
    await reportRepository.getItemsReport(

        restaurantId,

        from,

        to

    );
    const itemSheet =
    workbook.addWorksheet(
        "Items"
    );
itemSheet.columns = [

    {
        header: "Item",
        key: "item_name",
        width: 35
    },

    {
        header: "Qty Sold",
        key: "quantity",
        width: 15
    },

    {
        header: "Sales",
        key: "sales",
        width: 18
    }

];
items.forEach(item => {

    itemSheet.addRow({

        item_name:
            item.item_name,

        quantity:
            item.quantity,

        sales:
            item.sales

    });

});
itemSheet.getRow(1).font = {

    bold: true,

    color: {

        argb: "FFFFFFFF"

    }

};

itemSheet.getRow(1).fill = {

    type: "pattern",

    pattern: "solid",

    fgColor: {

        argb: "1E3A8A"

    }

};
for (

    let i = 2;

    i <= itemSheet.rowCount;

    i++

) {

    itemSheet.getCell(
        `C${i}`
    ).numFmt =
    '₹#,##0.00';

}
itemSheet.views = [

    {

        state: "frozen",

        ySplit: 1

    }

];

itemSheet.autoFilter = {

    from: "A1",

    to: "C1"

};    

const payments =
    await reportRepository.getPaymentsReport(

        restaurantId,

        from,

        to

    );
const paymentSheet =
    workbook.addWorksheet(
        "Payments"
    );
paymentSheet.columns = [

    {
        header: "Payment Method",
        key: "payment_method",
        width: 25
    },

    {
        header: "Orders",
        key: "total_orders",
        width: 15
    },

    {
        header: "Amount",
        key: "amount",
        width: 18
    }

];
payments.forEach(payment => {

    paymentSheet.addRow({

        payment_method:
            payment.payment_method,

        total_orders:
            payment.total_orders,

        amount:
            payment.amount

    });

});
paymentSheet.getRow(1).font = {

    bold: true,

    color: {

        argb: "FFFFFFFF"

    }

};

paymentSheet.getRow(1).fill = {

    type: "pattern",

    pattern: "solid",

    fgColor: {

        argb: "1E3A8A"

    }

};
for (

    let i = 2;

    i <= paymentSheet.rowCount;

    i++

) {

    paymentSheet.getCell(
        `C${i}`
    ).numFmt =
    '₹#,##0.00';

}
paymentSheet.views = [

    {

        state: "frozen",

        ySplit: 1

    }

];

paymentSheet.autoFilter = {

    from: "A1",

    to: "C1"

};
const audit =
    await reportRepository.getAuditReport(

        restaurantId,

        from,

        to

    );


const auditSheet =
    workbook.addWorksheet(
        "Audit"
    );
auditSheet.columns = [

    {
        header: "Metric",
        key: "metric",
        width: 35
    },

    {
        header: "Count",
        key: "value",
        width: 20
    }

];
auditSheet.addRows([

    {

        metric: "Total Orders",

        value: audit.total_orders

    },

    {

        metric: "Paid Orders",

        value: audit.paid_orders

    },

    {

        metric: "Cancelled Orders",

        value: audit.cancelled_orders

    },

    {

        metric: "Kitchen Pending",

        value: audit.kitchen_pending

    },

    {

        metric: "Billing Pending",

        value: audit.billing_pending

    },

    {

        metric: "Open Orders",

        value: audit.open_orders

    }

]);
auditSheet.getRow(1).font = {

    bold: true,

    color: {

        argb: "FFFFFFFF"

    }

};

auditSheet.getRow(1).fill = {

    type: "pattern",

    pattern: "solid",

    fgColor: {

        argb: "1E3A8A"

    }

};
auditSheet.views = [

    {

        state: "frozen",

        ySplit: 1

    }

];

auditSheet.autoFilter = {

    from: "A1",

    to: "B1"

};    

    res.setHeader(

        "Content-Type",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    );

    res.setHeader(

        "Content-Disposition",

        `attachment; filename=Restaurant_Report_${from}_to_${to}.xlsx`

    );

    await workbook.xlsx.write(res);

    res.end();

};