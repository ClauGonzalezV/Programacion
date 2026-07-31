/* ==========================================================================
   EMITIA PRO - RECURRING PAYMENTS & GATEWAYS MODULE
   Supports Mercado Pago (CLP), Webpay/Flow (CLP), Stripe (USD) & WhatsApp/Bank
   ========================================================================== */

const PaymentsModule = {
    // ⚙️ CONFIGURACIÓN DE ENLACES Y CREDENCIALES DE PAGO
    config: {
        mercadoPagoUrl: "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=demo_emitia_pro",
        flowWebpayUrl: "https://www.flow.cl/uri/kwkw9Kwxq",
        stripeUrl: "https://checkout.stripe.com/c/pay/demo_emitia_pro_usd",
        whatsappNumber: "+56961234567"
    },

    flowApiConfig: {
        apiKey: "59A13F6C-6D8A-4772-BD2C-718D350L27AA",
        secretKey: "4c8d54e57ad52821e7a406d030af0da6c5e78ad8"
    },

    environment: localStorage.getItem('emitia_env') || 'live',

    setEnvironment(env) {
        this.environment = env;
        localStorage.setItem('emitia_env', env);
        this.updateEnvironmentUI();
        if (typeof showToast === 'function') {
            showToast(`⚙️ Entorno de ejecución cambiado a: ${env.toUpperCase()}`, 'info');
        }
    },

    updateEnvironmentUI() {
        const btnSandbox = document.getElementById('btn-env-sandbox');
        const btnLive = document.getElementById('btn-env-live');
        if (btnSandbox && btnLive) {
            if (this.environment === 'sandbox') {
                btnSandbox.className = 'btn btn-sm btn-primary';
                btnLive.className = 'btn btn-sm btn-outline';
            } else {
                btnSandbox.className = 'btn btn-sm btn-outline';
                btnLive.className = 'btn btn-sm btn-primary';
            }
        }
    },

    showPaymentModal() {
        const modal = document.getElementById('modal-payment-gateways');
        if (modal) modal.classList.remove('hidden');
    },

    closePaymentModal() {
        const modal = document.getElementById('modal-payment-gateways');
        if (modal) modal.classList.add('hidden');
    },

    payWithMercadoPago() {
        if (this.environment === 'sandbox') {
            if (typeof showToast === 'function') showToast('⚡ [MODO PRUEBAS / SANDBOX] ¡Simulando cobro Mercado Pago y activación PRO!', 'success');
            setTimeout(() => {
                if (typeof AuthSubscription !== 'undefined') AuthSubscription.setPlan('pro', 1);
                this.closePaymentModal();
            }, 1000);
        } else if (this.config.mercadoPagoUrl && !this.config.mercadoPagoUrl.includes('demo_emitia_pro')) {
            if (typeof showToast === 'function') showToast('Redirigiendo a pasarela segura de Mercado Pago...', 'info');
            setTimeout(() => { window.open(this.config.mercadoPagoUrl, '_blank'); }, 1000);
        } else {
            if (typeof showToast === 'function') showToast('⚡ [DEMO] Modo prueba: ¡Plan PRO Activado con Mercado Pago!', 'success');
            setTimeout(() => {
                if (typeof AuthSubscription !== 'undefined') AuthSubscription.setPlan('pro');
                this.closePaymentModal();
            }, 1200);
        }
    },

    payWithWebpay() {
        if (this.environment === 'sandbox') {
            if (typeof showToast === 'function') showToast('⚡ [MODO PRUEBAS / SANDBOX] ¡Simulando cobro Flow Webpay y activación PRO!', 'success');
            setTimeout(() => {
                if (typeof AuthSubscription !== 'undefined') AuthSubscription.setPlan('pro', 1);
                this.closePaymentModal();
            }, 1000);
        } else if (this.config.flowWebpayUrl) {
            if (typeof showToast === 'function') showToast('Redirigiendo a pasarela segura Webpay (Flow.cl)...', 'info');
            setTimeout(() => { window.open(this.config.flowWebpayUrl, '_blank'); }, 800);
        } else {
            if (typeof showToast === 'function') showToast('⚡ [DEMO] Modo prueba: ¡Plan PRO Activado con Webpay Transbank!', 'success');
            setTimeout(() => {
                if (typeof AuthSubscription !== 'undefined') AuthSubscription.setPlan('pro');
                this.closePaymentModal();
            }, 1200);
        }
    },

    payWithStripe() {
        if (this.config.stripeUrl && !this.config.stripeUrl.includes('demo_emitia_pro_usd')) {
            if (typeof showToast === 'function') showToast('Redirigiendo a Stripe Checkout internacional...', 'info');
            setTimeout(() => { window.open(this.config.stripeUrl, '_blank'); }, 1000);
        } else {
            if (typeof showToast === 'function') showToast('⚡ [DEMO] Modo prueba: ¡Plan PRO Activado con Stripe USD!', 'success');
            setTimeout(() => {
                if (typeof AuthSubscription !== 'undefined') AuthSubscription.setPlan('pro');
                this.closePaymentModal();
            }, 1200);
        }
    },

    payWithWhatsApp() {
        const msg = encodeURIComponent('Hola Claudio! Quiero activar la suscripción PLAN PRO de Emitia Pro mediante Transferencia Bancaria.');
        window.open(`https://wa.me/${this.config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
    }
};
