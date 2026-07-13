const SubscriptionPayment = {

    async upgrade() {

        const response =
            await API.get(
                "/api/subscription/plans"
            );

        if (!response.success) {

            Notify.error(
                response.message
            );

            return;

        }

        this.showPlanModal(
            response.plans
        );

    },

    showPlanModal(plans) {

    let html = "";

    for (const plan of plans) {

        html += `

<label
class="mb-3 flex cursor-pointer items-center rounded-xl border p-4 hover:bg-slate-50">

<input

type="radio"

name="plan"

value="${plan.id}"

class="mr-4">

<div>

<p class="font-semibold">

${plan.display_name}

</p>

<p class="text-sm text-slate-500">

₹${plan.price}

/

${plan.duration_days} Days

</p>

</div>

</label>

`;

    }

    Modal.open(

        "Choose Plan",

        html,

        async () => {

            const selectedPlan =
                document.querySelector(
                    'input[name="plan"]:checked'
                );

            if (!selectedPlan) {

                Notify.error(
                    "Please select a plan."
                );

                return;

            }

            await this.createOrder(
                selectedPlan.value
            );

        },

        {

            buttonText:
                "Continue",

            loadingText:
                "Creating Order..."

        }

    );

},
    

async createOrder(planId) {

    const response =
        await API.post(

            "/api/subscription/create-order",

            {
                planId
            }

        );

    if (!response.success) {

        Notify.error(
            response.message
        );

        return;

    }

    Modal.close();

    this.openCheckout(
    response.key,
    response.order
);

},

   openCheckout(
    key,
    order
) {

    const razorpay =
        new Razorpay({

            key,

            amount:
                order.amount,

            currency:
                order.currency,

            name:
                "Align",

            description:
                "Subscription Payment",

            order_id:
                order.id,

            handler:
    async response => {

        try {

            await this.verifyPayment(
                response
            );

        } catch (err) {

            console.error(err);

            Notify.error(
                "Payment verification failed."
            );

        }

    },

            theme: {

                color:
                    "#2563eb"

            }

        });

razorpay.on(

    "payment.failed",

    response => {

        Notify.error(
            response.error.description
                ||
            "Payment failed."
        );

    }

);

 razorpay.open();

},

    async verifyPayment(payment) {

    const response =
        await API.post(

            "/api/subscription/verify-payment",

            {

                razorpay_order_id:
                    payment.razorpay_order_id,

                razorpay_payment_id:
                    payment.razorpay_payment_id,

                razorpay_signature:
                    payment.razorpay_signature

            }

        );

    if (!response.success) {

        Notify.error(
            response.message
        );

        return;

    }

    Notify.success(
        "Subscription upgraded successfully."
    );

    await loadSubscription();

}

};

