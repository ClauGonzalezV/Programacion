/* ==========================================================================
   EMITIA PRO - RECURRING PAYMENTS & GATEWAYS MODULE
   Supports Mercado Pago (CLP), Webpay/Flow (CLP), Stripe (USD) & WhatsApp/Bank
   ========================================================================== */

const PaymentsModule = {
    // ⚙️ CONFIGURACIÓN DE ENLACES Y CREDENCIALES DE PAGO REALES
    // Reemplaza esta URL con el enlace de cobro o suscripción real generado en tu cuenta de Mercado Pago:
    config: {
        mercadoPagoUrl: "https://mpago.la/2BqwXuE",
        flowWebpayUrl: "https://www.flow.cl/uri/kwkw9Kwxq"
    },

    requireUserAuth() {
        if (typeof AuthSubscription !== 'undefined' && !AuthSubscription.currentUser) {
            this.closePaymentModal();
            if (typeof AuthSubscription.closeModal === 'function') AuthSubscription.closeModal('modal-pricing');
            AuthSubscription.pendingPaymentAfterAuth = true;
            if (typeof showToast === 'function') {
                showToast('🔒 Para realizar el pago debes iniciar sesión o registrarte primero.', 'warning');
            }
            AuthSubscription.showLoginModal();
            return false;
        }
        return true;
    },

    showPaymentModal() {
        if (!this.requireUserAuth()) return;
        const modal = document.getElementById('modal-payment-gateways');
        if (modal) modal.classList.remove('hidden');
    },

    closePaymentModal() {
        const modal = document.getElementById('modal-payment-gateways');
        if (modal) modal.classList.add('hidden');
    },

    payWithMercadoPago() {
        if (!this.requireUserAuth()) return;
        if (typeof showToast === 'function') {
            showToast('💳 Redirigiendo a pasarela segura de Mercado Pago...', 'info');
        }
        setTimeout(() => {
            if (this.config.mercadoPagoUrl) {
                window.open(this.config.mercadoPagoUrl, '_blank');
            }
        }, 600);
    },

    payWithWebpay() {
        if (!this.requireUserAuth()) return;
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
        if (!this.requireUserAuth()) return;
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
        if (!this.requireUserAuth()) return;
        const msg = encodeURIComponent('Hola Claudio! Quiero activar la suscripción PLAN PRO de Emitia Pro mediante Transferencia Bancaria.');
        window.open(`https://wa.me/${this.config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
    }
};
