const db =
    require("../db");

exports.create = async (
    orderId,
    paymentMethod,
    amount
) =>
{
    return await db.runAsync(
        `
        INSERT INTO payment_splits
        (
            order_id,
            payment_method,
            amount
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
        `,
        [
            orderId,
            paymentMethod,
            amount
        ]
    );
};

exports.deleteByOrder = async (
    orderId
) =>
{
    return await db.runAsync(
        `
        DELETE
        FROM payment_splits
        WHERE order_id = ?
        `,
        [orderId]
    );
};

exports.getByOrder = async (
    orderId
) =>
{
    return await db.allAsync(
        `
        SELECT

            payment_method,

            amount

        FROM payment_splits

        WHERE order_id = ?

        ORDER BY id
        `,
        [orderId]
    );
};