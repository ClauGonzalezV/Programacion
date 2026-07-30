/* ==========================================================================
   EMITIA PRO - RECURRING PAYMENTS & GATEWAYS MODULE
   Supports Mercado Pago / Webpay (Chile CLP) & Stripe (Global USD)
   ========================================================================== */

const PaymentsModule = {
    // Commercial Subscription Checkout URLs
    checkoutUrls: {
        mercadoPagoChile: "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=demo_emitia_pro",
        webpayChile: "https://www.flow.cl/app/webpay/subscribe?plan=emitia_pro_clp",
        stripeUSD: "https://checkout.stripe.com/c/pay/demo_emitia_pro_usd"
    },

    openMercadoPagoCheckout() {
        showToast('Redirigiendo a pasarela segura de suscripción (Mercado Pago / Webpay)...', 'info');
        setTimeout(() => {
            // Simulated payment success for demonstration & testing
            if (typeof AuthSubscription !== 'undefined') {
                AuthSubscription.setPlan('pro');
            }
        }, 1500);
    },

    openStripeCheckout() {
        showToast('Redirigiendo a Stripe Checkout internacional...', 'info');
        setTimeout(() => {
            if (typeof AuthSubscription !== 'undefined') {
                AuthSubscription.setPlan('pro');
            }
        }, 1500);
    }
};
