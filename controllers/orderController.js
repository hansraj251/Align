const db = require("../db");
const orderService =
    require("../services/orderService");
exports.createOrder = (req, res) => {

    const restaurantId = req.user.restaurantId;

    const { table_id } = req.body;

    if (!table_id) {
        return res.status(400).json({
            success: false,
            message: "Table is required"
        });
    }

    db.run(
        `
        INSERT INTO orders
        (
            restaurant_id,
            table_id
        )
        VALUES (?, ?)
        `,
        [
            restaurantId,
            table_id
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                message: "Order created successfully",
                orderId: this.lastID
            });

        }
    );

};
exports.getActiveOrder = async (req, res) => {

    try {

        const order =
            await orderService.getActiveOrderByTable(

                req.user.restaurantId,

                req.params.tableId

            );

        res.json({

            success: true,

            hasActiveOrder: !!order,

            order

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.getOrder = async (req, res) => {

    try {

        const result =
            await orderService.getOrder(

                req.user.restaurantId,

                req.params.orderId

            );

        res.json(result);

    } catch (err) {

        res.status(404).json({

            success: false,

            message: err.message

        });

    }

};
exports.getOrderHistory = async (
    req,
    res
) => {

    try {

        const result =
            await orderService.getOrderHistory(

                req.user.restaurantId,

                req.query.from,

                req.query.to

            );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};