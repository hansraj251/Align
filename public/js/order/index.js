Align.Order.app = {

    init(config = {}) {

        Object.assign(

    Align.Order.state,

    config

);

        Cart.load();

        console.log(

            "Order initialized",

            Align.Order.state

        );

    }

};