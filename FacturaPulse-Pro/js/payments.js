/* ==========================================================================
   EMITIA PRO - RECURRING PAYMENTS & GATEWAYS MODULE
   Supports Mercado Pago (CLP), Webpay/Flow (CLP), Stripe (USD) & WhatsApp/Bank
   ========================================================================== */

const PaymentsModule = {
    // ⚙️ CONFIGURACIÓN DE ENLACES Y CREDENCIALES DE PAGO REALES
    // Reemplaza esta URL con el enlace de cobro o suscripción real generado en tu cuenta de Mercado Pago:
    config: {
        mercadoPagoUrl: "https://mpago.la/2BqwXuE",
        flowWebpayUrl: "https://www.flow.cl/uri/0BTj8Mtxz"
    },

    getUserEmail() {
        if (typeof AuthSubscription !== 'undefined' && AuthSubscription.currentUser) {
            return AuthSubscription.currentUser.email || '';
        }
        try {
            const savedUser = JSON.parse(localStorage.getItem('facturapulse_user'));
            if (savedUser && savedUser.email) return savedUser.email;
        } catch (e) {}
        return '';
    },

    appendUserEmailToUrl(url) {
        if (!url) return '';
        const email = this.getUserEmail();
        if (!email) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}email=${encodeURIComponent(email)}&payer_email=${encodeURIComponent(email)}&email_client=${encodeURIComponent(email)}&external_reference=${encodeURIComponent(email)}`;
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
        const userEmail = this.getUserEmail();
        const finalUrl = this.appendUserEmailToUrl(this.config.mercadoPagoUrl);
        if (typeof showToast === 'function') {
            showToast(`💳 Redirigiendo a Mercado Pago (${userEmail || 'Usuario'})...`, 'info');
        }
        setTimeout(() => {
            if (finalUrl) {
                window.open(finalUrl, '_blank');
            }
        }, 600);
    },

    async payWithWebpay() {
        if (!this.requireUserAuth()) return;
        const userEmail = this.getUserEmail();
        if (typeof showToast === 'function') showToast(`⚡ Redirigiendo a pasarela de cobro Webpay Flow...`, 'info');

        try {
            const response = await fetch('/api/create-flow-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, amount: 9990, planName: 'Emitia Pro - Plan PRO Mensual' })
            });
            const resData = await response.json();
            if (resData && resData.redirectUrl) {
                window.open(resData.redirectUrl, '_blank');
                return;
            }
        } catch (e) {
            console.log('Flow API endpoint execution:', e.message);
        }

        const finalUrl = this.appendUserEmailToUrl(this.config.flowWebpayUrl);
        setTimeout(() => { window.open(finalUrl, '_blank'); }, 600);
    },

    payWithStripe() {
        if (!this.requireUserAuth()) return;
        const userEmail = this.getUserEmail();
        if (this.config.stripeUrl && !this.config.stripeUrl.includes('demo_emitia_pro_usd')) {
            const finalUrl = this.appendUserEmailToUrl(this.config.stripeUrl);
            if (typeof showToast === 'function') showToast(`Redirigiendo a Stripe Checkout (${userEmail || 'Usuario'})...`, 'info');
            setTimeout(() => { window.open(finalUrl, '_blank'); }, 1000);
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
        const userEmail = this.getUserEmail();
        const msg = encodeURIComponent(`Hola! Quiero activar la suscripción PLAN PRO de Emitia Pro para mi usuario registrado: ${userEmail}`);
        const phone = this.config.whatsappNumber ? this.config.whatsappNumber.replace(/[^0-9]/g, '') : '56988888888';
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    }
};
