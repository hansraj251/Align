const SubscriptionPayment = {

    async upgrade(
    subscription
) {

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
      let plans =
    response.plans;
    if (
    subscription &&
    subscription.plan_id
) {

    plans =
        plans.filter(
            plan =>
                plan.id >
                subscription.plan_id
        );

}
if (
    plans.length === 0
) {

    Notify.info(
        "You are already using the highest available plan."
    );

    return;

}

this.showPlanModal(
    plans
);

    },

    showPlanModal(plans) {

    let html = "";

    for (const plan of plans) {

        html += `
<div class="mb-5 rounded-xl border p-4">

    <h3 class="text-lg font-semibold">
        ${plan.display_name}
    </h3>

    <p class="mb-3 text-sm text-slate-500">
        ${plan.description || ""}
    </p>
`;

        for (const pricing of plan.pricing) {

            html += `
<label class="mb-2 flex cursor-pointer items-center rounded-lg border p-3 hover:bg-slate-50">

    <input
        type="radio"
        name="pricing"
        value="${pricing.id}"
        class="mr-3">

    <div class="flex-1">

        <div class="font-medium">
            ${pricing.duration_days} Days
        </div>

        <div class="text-sm text-slate-500">
            ₹${pricing.price}
        </div>

    </div>

</label>
`;
        }

        html += `
</div>
`;
    }

    Modal.open(

        "Choose Plan",

        html,

        async () => {

            const selectedPricing =
                document.querySelector(
                    'input[name="pricing"]:checked'
                );

            if (!selectedPricing) {

                Notify.error(
                    "Please select a plan."
                );

                return;

            }

            await this.createOrder(
                Number(
                    selectedPricing.value
                )
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

async renew(subscription) {

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

    const plans =
        response.plans;

    const currentPlan =
        plans.find(
            plan =>
                plan.id ===
                subscription.plan_id
        );

    if (!currentPlan) {

        Notify.error(
            "Current plan not found."
        );

        return;

    }

    this.showPlanModal([
        currentPlan
    ]);

},
    

async createOrder(pricingId) {

    const response =
        await API.post(

            "/api/subscription/create-order",

            {
    pricingId
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

        })
        ;
        

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

