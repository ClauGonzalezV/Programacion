/* ==========================================================================
   LEGAL COMPLIANCE & COOKIE CONSENT MODULE (Emitia Pro v37)
   ========================================================================== */

const LegalModule = {
    COOKIE_KEY: 'emitia_cookie_consent',

    init() {
        this.checkCookieConsent();
        this.bindEvents();
    },

    checkCookieConsent() {
        const consent = localStorage.getItem(this.COOKIE_KEY);
        const banner = document.getElementById('cookie-consent-banner');
        if (!banner) return;

        if (!consent) {
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    },

    acceptCookies() {
        localStorage.setItem(this.COOKIE_KEY, 'accepted');
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) banner.classList.add('hidden');
        if (typeof showToast === 'function') {
            showToast('🍪 Preferencias de cookies guardadas (Aceptadas).', 'info');
        }
    },

    declineCookies() {
        localStorage.setItem(this.COOKIE_KEY, 'declined');
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) banner.classList.add('hidden');
        if (typeof showToast === 'function') {
            showToast('🍪 Se ha registrado tu preferencia (Desactivadas cookies no esenciales).', 'info');
        }
    },

    resetCookieConsent() {
        localStorage.removeItem(this.COOKIE_KEY);
        this.checkCookieConsent();
    },

    openTermsModal() {
        const modal = document.getElementById('modal-terms');
        if (modal) modal.classList.remove('hidden');
    },

    closeTermsModal() {
        const modal = document.getElementById('modal-terms');
        if (modal) modal.classList.add('hidden');
    },

    openPrivacyModal() {
        const modal = document.getElementById('modal-privacy');
        if (modal) modal.classList.remove('hidden');
    },

    closePrivacyModal() {
        const modal = document.getElementById('modal-privacy');
        if (modal) modal.classList.add('hidden');
    },

    bindEvents() {
        const btnAccept = document.getElementById('btn-cookie-accept');
        if (btnAccept) btnAccept.addEventListener('click', () => this.acceptCookies());

        const btnDecline = document.getElementById('btn-cookie-decline');
        if (btnDecline) btnDecline.addEventListener('click', () => this.declineCookies());

        // Event delegation for opening legal modals via links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-open-legal]');
            if (!target) return;
            const type = target.getAttribute('data-open-legal');
            e.preventDefault();
            if (type === 'terms') this.openTermsModal();
            if (type === 'privacy') this.openPrivacyModal();
            if (type === 'cookies') this.resetCookieConsent();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    LegalModule.init();
});
