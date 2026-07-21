Align.Order.cart = {

    find(
    menuItemId = null,
    variantId = null,
    quickItemId = null
) {

    return Align.Order.state.cart.find(item => {

        if (quickItemId) {

            return (
                item.is_quick_item &&
                item.quick_item_id == quickItemId
            );

        }

        return (

            !item.is_quick_item &&

            item.menu_item_id == menuItemId &&

            (item.variant_id || null) ==

            (variantId || null)

        );

    });

},

    add(item) {

        const existing = this.find(

    item.menu_item_id,

    item.variant_id,

    item.quick_item_id

);

        if (existing) {

            existing.quantity++;

        }

        else {

            Align.Order.state.cart.push({

    menu_item_id:
        item.menu_item_id || null,

    quick_item_id:
        item.quick_item_id || null,

    is_quick_item:
        item.is_quick_item || 0,

    item_name:
        item.item_name,

    variant_id:
        item.variant_id || null,

    variant_name:
        item.variant_name || null,

    unit_price:
        item.unit_price,

    quantity: 1,

    notes: ""

});
        }

        this.save();

    },

increase(
    menuItemId = null,
    variantId = null,
    quickItemId = null
) {

    const item =
        this.find(
            menuItemId,
            variantId,
            quickItemId
        );

    if (!item) {

        return;

    }

    item.quantity++;

    this.save();

},

 decrease(
    menuItemId = null,
    variantId = null,
    quickItemId = null
) {

    const item =
        this.find(
            menuItemId,
            variantId,
            quickItemId
        );

    if (!item) {

        return;

    }

    item.quantity--;

    if (item.quantity <= 0) {

        this.remove(
            menuItemId,
            variantId,
            quickItemId
        );

        return;

    }

    this.save();

},

  remove(
    menuItemId = null,
    variantId = null,
    quickItemId = null
) {

    Align.Order.state.cart =
        Align.Order.state.cart.filter(item => {

            if (quickItemId) {

                return !(
                    item.is_quick_item &&
                    item.quick_item_id == quickItemId
                );

            }

            return !(

                !item.is_quick_item &&

                item.menu_item_id == menuItemId &&

                (item.variant_id || null) ==
                (variantId || null)

            );

        });

    this.save();

},

    clear() {

        Align.Order.state.cart = [];

        this.save();

    },

    total() {

        return Align.Order.state.cart.reduce(

            (sum, item) =>

                sum +

                item.unit_price *

                item.quantity,

            0

        );

    },

    save() {

        sessionStorage.setItem(

            Align.Order.state.cartKey,

            JSON.stringify(

                Align.Order.state.cart

            )

        );

    },

    load() {

        Align.Order.state.cart =

            JSON.parse(

                sessionStorage.getItem(

                    Align.Order.state.cartKey

                ) || "[]"

            );

    }

};