const reportRepository =
    require("../repositories/reportRepository");
const ExcelJS =
    require("exceljs");
const settingsRepository =
    require("../repositories/settingsRepository");  
const restaurantRepository =
    require("../repositories/restaurantRepository");     
const PDFDocument =
    require("pdfkit");   
const path =
    require("path");  
const fs =
    require("fs");        
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
    
    const settings =
    await settingsRepository.getSettings(
        restaurantId
    );
    
    let currencyFormat =
    "₹#,##0.00";

switch (settings.currency) {

    case "USD":

        currencyFormat =
            "$#,##0.00";

        break;

    case "EUR":

        currencyFormat =
            "€#,##0.00";

        break;

    case "GBP":

        currencyFormat =
            "£#,##0.00";

        break;

    case "AED":

        currencyFormat =
            '[$AED]#,##0.00';

        break;

}
    

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

        currencyFormat;

}
salesSheet.getCell(

    "B8"

).numFmt =

currencyFormat;
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

    ["B","C","D","E"].forEach(col => {

        orderSheet.getCell(

            `${col}${i}`

        ).numFmt =

        currencyFormat;

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

    to: "G1"

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
    currencyFormat;

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
        header: "Amount",
        key: "amount",
        width: 18
    }

];
payments.forEach(payment => {

    paymentSheet.addRow({

        payment_method:
            payment.payment_method,

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
        `B${i}`
    ).numFmt =
    currencyFormat;

}
paymentSheet.views = [

    {

        state: "frozen",

        ySplit: 1

    }

];

paymentSheet.autoFilter = {

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

exports.downloadPdf = async (
    restaurantId,
    from,
    to,
    res
) => {
    
    const settings =
    await settingsRepository.getSettings(
        restaurantId
    );

const restaurant =
    await restaurantRepository.getById(
        restaurantId
    );
  
    const salesReport =
    await reportRepository.getSalesSummary(
        restaurantId,
        from,
        to
    );

let currencyCode = "INR";

switch (settings.currency) {

    case "USD":
        currencyCode = "USD";
        break;

    case "EUR":
        currencyCode = "EUR";
        break;

    case "GBP":
        currencyCode = "GBP";
        break;

    case "AED":
        currencyCode = "AED";
        break;

}
const formatCurrency = (
    amount
) => {

    return `${currencyCode} ${Number(
        amount || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

};
const formatDate = (
    date
) => {

    return new Date(date)
        .toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

};
const generatedOn =
    new Date().toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
    
    

    const doc =
        new PDFDocument({
            margin: 40,
            size: "A4"
        });
    let logoPath = null;

if (restaurant.logo) {

    logoPath =
        path.join(
            __dirname,
            "..",
            restaurant.logo.replace(
                /^\//,
                ""
            )
        );

}
    if (
    logoPath &&
    fs.existsSync(logoPath)
) {

    doc
        .save()
        .opacity(0.08)
        .image(
            logoPath,
            150,
            220,
            {
                fit: [300, 300],
                align: "center",
                valign: "center"
            }
        )
        .restore();

}

if (
    logoPath &&
    fs.existsSync(logoPath)
) {

    doc.image(
        logoPath,
        40,
        30,
        {
            fit: [70, 70]
        }
    );

}   
    

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=Restaurant_Report_${from}_to_${to}.pdf`
    );

    doc.pipe(res);

doc
    .fontSize(20)
    .text(
        restaurant.name,
        125,
        35
    );

doc
    .fontSize(10)
    .text(
        `${restaurant.address || ""}, ${restaurant.city || ""}, ${restaurant.state || ""} ${restaurant.pincode || ""}
Mobile: ${restaurant.mobile || "-"}
GST: ${restaurant.gst_number || "-"}`,
        125,
        60,
        {
            width: 300
        }
    );

doc
    .fontSize(18)
    .text(
        "REPORT",
        390,
        40,
        {
            width: 160,
            align: "right"
        }
    );

doc
    .fontSize(11)
    .text(
        `Period: ${formatDate(from)} - ${formatDate(to)}`,
        40,
        120
    );

doc.text(
    `Generated On: ${generatedOn}`,
        40,
        135
);

doc
    .fontSize(14)
    .text(
        "Sales Summary",
        40,
        195
    );

doc.moveDown(0.5);

const tableX = 40;

const tableY = 220;

const tableWidth = 515;

const labelWidth = 300;

const valueWidth = tableWidth - labelWidth;

const rowHeight = 26;

doc
    .save()
    .fillColor("#f3f4f6")
    .rect(
        tableX,
        tableY,
        tableWidth,
        rowHeight
    )
    .fill()
    .restore();

doc
    .rect(
        tableX,
        tableY,
        tableWidth,
        rowHeight
    )
    .stroke();

doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(
        "Metric",
        tableX + 10,
        tableY + 8
    );

doc
    .text(
        "Value",
        tableX + labelWidth,
        tableY + 8,
        {
            width: valueWidth - 10,
            align: "right"
        }
    );

let currentY = tableY + rowHeight;

const addRow = (
    label,
    value
) => {

    doc.rect(
        tableX,
        currentY,
        tableWidth,
        rowHeight
    ).stroke();

    doc
        .font("Helvetica")
        .fontSize(10)
        .text(
            label,
            tableX + 10,
            currentY + 8
        );

    doc.text(
        value,
        tableX + labelWidth,
        currentY + 8,
        {
            width: valueWidth - 10,
            align: "right"
        }
    );

    currentY += rowHeight;

};

addRow(
    "Total Orders",
    String(
        salesReport.total_orders
    )
);

addRow(
    "Gross Sales",
    formatCurrency(
        salesReport.gross_sales
    )
);

addRow(
    "Discount",
    formatCurrency(
        salesReport.total_discount
    )
);

addRow(
    "Tax",
    formatCurrency(
        salesReport.total_tax
    )
);

addRow(
    "Net Sales",
    formatCurrency(
        salesReport.net_sales
    )
);

doc.end();

};
