/* ==========================================================================
   EMITIA PRO - FIREBASE AUTHENTICATION & SUBSCRIPTION MODULE
   ========================================================================== */

const AuthSubscription = {
    firebaseConfig: {
        apiKey: "AIzaSyDAzVbDu1ApYhu46_D5d-6k_31XX7yyWAg",
        authDomain: "emitia-pro.firebaseapp.com",
        projectId: "emitia-pro",
        storageBucket: "emitia-pro.firebasestorage.app",
        messagingSenderId: "740879126374",
        appId: "1:740879126374:web:44eb5b07f0c1d0fa3142a7",
        measurementId: "G-BWNRJRBK7H"
    },

    currentUser: null,
    userPlan: { isPro: false, planName: 'PLAN GRATUITO', expiresAt: null },

    isDemoConfig() {
        return !this.firebaseConfig.apiKey || this.firebaseConfig.apiKey.startsWith('AIzaSyDemoKey');
    },

    init() {
        const savedPlan = localStorage.getItem('emitia_user_plan');
        if (savedPlan) {
            try { this.userPlan = JSON.parse(savedPlan); } catch (e) {}
        }

        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && !firebase.apps.length) {
            try {
                firebase.initializeApp(this.firebaseConfig);
                if (typeof CloudSync !== 'undefined' && CloudSync.enableOfflinePersistence) {
                    CloudSync.enableOfflinePersistence();
                }
                this.bindFirebaseEvents();
            } catch (err) {
                console.log('Firebase init demo mode:', err);
            }
        }
        this.bindUIEvents();
        this.updateUI();
        this.applyPlanRestrictions();
    },

    bindFirebaseEvents() {
        if (typeof firebase === 'undefined' || !firebase.auth) return;

        firebase.auth().onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                this.loadUserData(user);
            } else {
                this.updateUI();
            }
        });
    },

    bindUIEvents() {
        const btnAuth = document.getElementById('btn-auth-user');
        if (btnAuth) {
            btnAuth.addEventListener('click', () => {
                if (this.currentUser) {
                    this.showAccountModal();
                } else {
                    this.showLoginModal();
                }
            });
        }

        const btnPricing = document.getElementById('btn-show-pricing');
        if (btnPricing) {
            btnPricing.addEventListener('click', () => this.showPricingModal());
        }

        // Email Form Submit
        const formAuth = document.getElementById('form-modal-auth');
        if (formAuth) {
            formAuth.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('modal-auth-email').value;
                const pass = document.getElementById('modal-auth-password').value;
                const isRegister = document.getElementById('modal-auth-is-register').value === 'true';

                if (isRegister) {
                    this.signUpWithEmail(email, pass);
                } else {
                    this.signInWithEmail(email, pass);
                }
            });
        }

        // Google Auth Button
        const btnGoogle = document.getElementById('btn-auth-google');
        if (btnGoogle) {
            btnGoogle.addEventListener('click', () => this.signInWithGoogle());
        }

        // Toggle Login vs Register
        const toggleBtn = document.getElementById('btn-toggle-auth-mode');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleAuthMode());
        }

        // Logout
        const btnLogout = document.getElementById('btn-auth-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => this.signOut());
        }

        // Pricing Plan Buttons
        const btnSubscribePro = document.getElementById('btn-subscribe-pro');
        if (btnSubscribePro) {
            btnSubscribePro.addEventListener('click', () => this.setPlan('pro'));
        }

        const btnSelectFree = document.getElementById('btn-select-free');
        if (btnSelectFree) {
            btnSelectFree.addEventListener('click', () => this.setPlan('free'));
        }

        const btnAccountUpgrade = document.getElementById('btn-account-upgrade-pro');
        if (btnAccountUpgrade) {
            btnAccountUpgrade.addEventListener('click', () => {
                this.closeModal('modal-account');
                this.showPricingModal();
            });
        }
    },

    setPlan(planType) {
        if (planType === 'pro') {
            this.userPlan = { isPro: true, planName: 'PLAN PRO', expiresAt: '2026-12-31' };
            localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
            this.updateUI();
            this.applyPlanRestrictions();
            this.closeModal('modal-pricing');
            showToast('💎 ¡Plan PRO Activado! Todas las plantillas y funciones están desbloqueadas.', 'success');
        } else {
            this.userPlan = { isPro: false, planName: 'PLAN GRATUITO', expiresAt: null };
            localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
            this.updateUI();
            this.applyPlanRestrictions();
            this.closeModal('modal-pricing');
            showToast('Has cambiado al Plan Gratuito.', 'info');
        }
    },

    signUpWithEmail(email, password) {
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    this.currentUser = cred.user;
                    this.setPlan('free');
                    showToast(`¡Cuenta registrada en Plan Gratuito! Bienvenido/a ${cred.user.email}`, 'success');
                    this.closeModal('modal-auth');
                })
                .catch(err => {
                    showToast(`Error al crear cuenta: ${err.message}`, 'error');
                });
        } else {
            // Local Demo Session - Starts on Free Plan
            this.currentUser = { email: email, displayName: email.split('@')[0], uid: 'user_' + Date.now() };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            this.setPlan('free');
            showToast(`¡Cuenta creada con éxito! Estás en el Plan Gratuito.`, 'success');
            this.closeModal('modal-auth');
        }
    },

    signInWithEmail(email, password) {
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(cred => {
                    this.currentUser = cred.user;
                    this.updateUI();
                    this.applyPlanRestrictions();
                    showToast(`Sesión iniciada como ${cred.user.email}`, 'success');
                    this.closeModal('modal-auth');
                })
                .catch(err => {
                    showToast(`Error de inicio de sesión: ${err.message}`, 'error');
                });
        } else {
            // Local Demo Session
            this.currentUser = { email: email, displayName: email.split('@')[0], uid: 'user_' + Date.now() };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            this.updateUI();
            this.applyPlanRestrictions();
            showToast(`Sesión iniciada correctamente`, 'success');
            this.closeModal('modal-auth');
        }
    },

    signInWithGoogle() {
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(result => {
                    this.currentUser = result.user;
                    this.updateUI();
                    this.applyPlanRestrictions();
                    showToast(`Bienvenido/a ${result.user.displayName}`, 'success');
                    this.closeModal('modal-auth');
                })
                .catch(err => {
                    showToast(`Error con Google Auth: ${err.message}`, 'error');
                });
        } else {
            // Local Demo Session
            this.currentUser = { email: 'demo@emitia.pro', displayName: 'Usuario Google', uid: 'user_google_demo' };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            this.updateUI();
            this.applyPlanRestrictions();
            showToast(`Sesión iniciada con Google`, 'success');
            this.closeModal('modal-auth');
        }
    },

    signOut() {
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().then(() => {
                showToast('Sesión cerrada', 'info');
                this.closeModal('modal-account');
                this.currentUser = null;
                this.updateUI();
            });
        } else {
            this.currentUser = null;
            localStorage.removeItem('emitia_demo_user');
            showToast('Sesión cerrada', 'info');
            this.closeModal('modal-account');
            this.updateUI();
        }
    },

    loadUserData(user) {
        this.updateUI();
        if (typeof CloudSync !== 'undefined' && CloudSync.syncAllOnLogin) {
            CloudSync.syncAllOnLogin();
        }
    },

    updateUI() {
        const btnAuth = document.getElementById('btn-auth-user');
        const badgePlan = document.getElementById('user-plan-badge');

        if (btnAuth) {
            if (this.currentUser) {
                btnAuth.innerHTML = `<i class="fa-solid fa-circle-user" style="color:#10b981;"></i> <span>${this.currentUser.displayName || this.currentUser.email.split('@')[0]}</span>`;
                btnAuth.classList.remove('btn-outline');
                btnAuth.classList.add('btn-secondary');
            } else {
                btnAuth.innerHTML = `<i class="fa-solid fa-user"></i> <span>Iniciar Sesión</span>`;
                btnAuth.classList.remove('btn-secondary');
                btnAuth.classList.add('btn-outline');
            }
        }

        if (badgePlan) {
            badgePlan.textContent = this.userPlan.planName;
            if (this.userPlan.isPro) {
                badgePlan.className = 'badge-plan badge-plan--pro';
            } else {
                badgePlan.className = 'badge-plan badge-plan--free';
            }
        }
    },

    applyPlanRestrictions() {
        try {
            // 1. Templates Restriction (2 basic for Free, 8 for PRO)
            const templateSelect = document.getElementById('doc-template');
            if (templateSelect && templateSelect.options) {
                const proTemplates = ['dark', 'classic', 'minimal', 'colorful', 'corporate', 'neon'];
                Array.from(templateSelect.options).forEach(opt => {
                    if (proTemplates.includes(opt.value)) {
                        if (this.userPlan.isPro) {
                            opt.disabled = false;
                            opt.textContent = opt.textContent.replace(' 🔒 (Plan PRO)', '');
                        } else {
                            opt.disabled = true;
                            if (!opt.textContent.includes('🔒')) {
                                opt.textContent += ' 🔒 (Plan PRO)';
                            }
                        }
                    }
                });
                if (!this.userPlan.isPro && proTemplates.includes(templateSelect.value)) {
                    templateSelect.value = 'modern';
                    if (typeof EditorModule !== 'undefined' && EditorModule.recalculateAndRender) {
                        EditorModule.recalculateAndRender();
                    }
                }
            }

            // 2. Multi-Language Restriction (Spanish only for Free, EN/PT for PRO)
            const langSelect = document.getElementById('doc-language');
            if (langSelect && langSelect.options) {
                Array.from(langSelect.options).forEach(opt => {
                    if (opt.value !== 'es') {
                        if (this.userPlan.isPro) {
                            opt.disabled = false;
                            opt.textContent = opt.textContent.replace(' 🔒 (Plan PRO)', '');
                        } else {
                            opt.disabled = true;
                            if (!opt.textContent.includes('🔒')) {
                                opt.textContent += ' 🔒 (Plan PRO)';
                            }
                        }
                    }
                });
                if (!this.userPlan.isPro && langSelect.value !== 'es') {
                    langSelect.value = 'es';
                    if (typeof EditorModule !== 'undefined' && EditorModule.recalculateAndRender) {
                        EditorModule.recalculateAndRender();
                    }
                }
            }

            // 3. Navigation Tabs Lock Indicators (Dashboard, Clientes, Servicios, Historial)
            const lockedTabs = [
                { id: 'tab-btn-dashboard', label: 'Dashboard' },
                { id: 'tab-btn-clients', label: 'Clientes' },
                { id: 'tab-btn-catalog', label: 'Servicios' },
                { id: 'tab-btn-history', label: 'Historial' }
            ];

            lockedTabs.forEach(item => {
                const tabBtn = document.getElementById(item.id);
                if (tabBtn) {
                    const span = tabBtn.querySelector('span:not(.badge-count)');
                    if (span) {
                        if (this.userPlan.isPro) {
                            tabBtn.classList.remove('tab-locked');
                            span.textContent = item.label;
                        } else {
                            tabBtn.classList.add('tab-locked');
                            span.textContent = `${item.label} 🔒`;
                        }
                    }
                }
            });

            // 4. PDF and Print Buttons Lock Indicator
            const btnExportPdf = document.getElementById('btn-export-pdf');
            const btnPrintDirect = document.getElementById('btn-print-direct');

            if (btnExportPdf) {
                const btnText = btnExportPdf.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = this.userPlan.isPro ? 'PDF' : 'PDF 🔒';
                }
            }
            if (btnPrintDirect) {
                btnPrintDirect.innerHTML = this.userPlan.isPro 
                    ? '<i class="fa-solid fa-print"></i> Imprimir / PDF'
                    : '<i class="fa-solid fa-lock"></i> Imprimir / PDF';
            }
        } catch (err) {
            console.warn('applyPlanRestrictions non-fatal info:', err);
        }
    },

    showLoginModal() {
        const modal = document.getElementById('modal-auth');
        if (modal) modal.classList.remove('hidden');
    },

    showAccountModal() {
        const modal = document.getElementById('modal-account');
        if (modal) {
            document.getElementById('modal-account-email').textContent = this.currentUser ? this.currentUser.email : 'usuario@emitia.pro';
            const planBadge = document.getElementById('modal-account-plan');
            if (planBadge) {
                planBadge.textContent = this.userPlan.planName;
                planBadge.className = this.userPlan.isPro ? 'badge-plan badge-plan--pro' : 'badge-plan badge-plan--free';
            }
            const btnUpgrade = document.getElementById('btn-account-upgrade-pro');
            if (btnUpgrade) {
                btnUpgrade.style.display = this.userPlan.isPro ? 'none' : 'inline-flex';
            }
            modal.classList.remove('hidden');
        }
    },

    showPricingModal() {
        const modal = document.getElementById('modal-pricing');
        if (modal) modal.classList.remove('hidden');
    },

    toggleAuthMode() {
        const isRegisterInput = document.getElementById('modal-auth-is-register');
        const title = document.getElementById('modal-auth-title');
        const submitBtn = document.getElementById('modal-auth-submit');
        const toggleBtn = document.getElementById('btn-toggle-auth-mode');

        if (isRegisterInput.value === 'true') {
            isRegisterInput.value = 'false';
            title.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión';
            submitBtn.textContent = 'Ingresar a Emitia Pro';
            toggleBtn.textContent = '¿No tienes cuenta? Regístrate aquí';
        } else {
            isRegisterInput.value = 'true';
            title.innerHTML = '<i class="fa-solid fa-user-plus"></i> Crear Cuenta Pro';
            submitBtn.textContent = 'Registrarse Gratis';
            toggleBtn.textContent = '¿Ya tienes cuenta? Inicia Sesión';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
    }
};

// Safe Initialization
const initAuthModule = () => {
    const savedDemo = localStorage.getItem('emitia_demo_user');
    if (savedDemo) {
        try {
            AuthSubscription.currentUser = JSON.parse(savedDemo);
        } catch (e) {}
    }
    AuthSubscription.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthModule);
} else {
    initAuthModule();
}
