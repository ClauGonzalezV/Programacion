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
    pendingPaymentAfterAuth: false,
    userPlan: { isPro: false, planName: 'PLAN GRATUITO', expiresAt: null },
    adminEmails: ['gonzalezclaudioxdxd@gmail.com'],

    isAdminUser() {
        if (!this.currentUser) {
            const savedDemo = localStorage.getItem('emitia_demo_user');
            if (savedDemo) {
                try {
                    const parsed = JSON.parse(savedDemo);
                    if (parsed && parsed.email && this.adminEmails.includes(parsed.email.toLowerCase().trim())) {
                        return true;
                    }
                } catch (e) {}
            }
            return false;
        }
        const email = typeof this.currentUser === 'object' ? (this.currentUser.email || '') : String(this.currentUser);
        return this.adminEmails.includes(email.toLowerCase().trim());
    },

    isDemoConfig() {
        return !this.firebaseConfig.apiKey || this.firebaseConfig.apiKey.startsWith('AIzaSyDemoKey');
    },

    init() {
        if (this.isAdminUser()) {
            this.userPlan = { isPro: true, planName: 'PLAN ADMIN PRO 👑', expiresAt: '2099-12-31' };
            localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
        } else {
            const savedPlan = localStorage.getItem('emitia_user_plan');
            if (savedPlan) {
                try { this.userPlan = JSON.parse(savedPlan); } catch (e) {}
            }
            this.checkPlanExpiration();
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
        this.checkUrlPaymentReturn();
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

        const btnSubscribePro = document.getElementById('btn-subscribe-pro');
        if (btnSubscribePro) {
            btnSubscribePro.addEventListener('click', () => {
                if (!this.currentUser) {
                    this.pendingPaymentAfterAuth = true;
                    this.closeModal('modal-pricing');
                    if (typeof showToast === 'function') {
                        showToast('🔒 Debes iniciar sesión o registrarte primero para realizar el pago del PLAN PRO.', 'warning');
                    }
                    this.showLoginModal();
                    return;
                }
                this.closeModal('modal-pricing');
                if (typeof PaymentsModule !== 'undefined' && PaymentsModule.showPaymentModal) {
                    PaymentsModule.showPaymentModal();
                } else if (typeof PaymentsModule !== 'undefined' && PaymentsModule.payWithWebpay) {
                    PaymentsModule.payWithWebpay();
                } else {
                    window.open("https://www.flow.cl/uri/tWKV0dM6v", "_blank");
                }
            });
        }

        const btnSelectFree = document.getElementById('btn-select-free');
        if (btnSelectFree) {
            btnSelectFree.addEventListener('click', () => this.setPlan('free'));
        }

        const btnAccountUpgrade = document.getElementById('btn-account-upgrade-pro');
        if (btnAccountUpgrade) {
            btnAccountUpgrade.addEventListener('click', () => {
                if (!this.currentUser) {
                    this.pendingPaymentAfterAuth = true;
                    this.closeModal('modal-account');
                    if (typeof showToast === 'function') {
                        showToast('🔒 Debes iniciar sesión o registrarte primero para realizar el pago del PLAN PRO.', 'warning');
                    }
                    this.showLoginModal();
                    return;
                }
                this.closeModal('modal-account');
                if (typeof PaymentsModule !== 'undefined' && PaymentsModule.showPaymentModal) {
                    PaymentsModule.showPaymentModal();
                } else {
                    this.showPricingModal();
                }
            });
        }

        // Global Developer Keyboard Shortcut: Ctrl + Shift + A (Restricted to gonzalezclaudioxdxd@gmail.com)
        if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
                    e.preventDefault();
                    if (this.isAdminUser()) {
                        this.showAdminPanel();
                        if (typeof showToast === 'function') showToast('🛠️ Panel Desarrollador activado (Ctrl + Shift + A)', 'info');
                    }
                }
            });
        }
    },

    setPlan(planType, months = 1, paymentMethod = 'Flow / Webpay') {
        const now = new Date();
        const subscribedAtIso = now.toISOString();

        if (planType === 'pro') {
            const expDate = new Date();
            expDate.setMonth(expDate.getMonth() + months);
            const expiresAtIso = expDate.toISOString().split('T')[0];

            this.userPlan = {
                isPro: true,
                planName: 'PLAN PRO',
                paymentStatus: 'PAID',
                subscribedAt: subscribedAtIso,
                expiresAt: expiresAtIso,
                lastPaymentMethod: paymentMethod
            };
            localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
            if (this.currentUser) this.saveUserProfileToCloud(this.currentUser);
            this.updateUI();
            this.applyPlanRestrictions();
            this.closeModal('modal-pricing');
            if (typeof showToast === 'function') {
                showToast(`💎 ¡Plan PRO Activado! Contratado el ${now.toLocaleDateString()} — Válido hasta el ${expiresAtIso}.`, 'success');
            }
        } else {
            const today = new Date().toISOString().split('T')[0];
            const hasActivePro = this.userPlan && this.userPlan.isPro && (this.isAdminUser() || !this.userPlan.expiresAt || today <= this.userPlan.expiresAt);

            if (hasActivePro) {
                this.closeModal('modal-pricing');
                if (typeof showToast === 'function') {
                    const expMsg = this.isAdminUser() ? 'Acceso Administrador Ilimitado' : `Válido hasta el ${this.userPlan.expiresAt}`;
                    showToast(`💎 Tu PLAN PRO se encuentra activo (${expMsg}). Mantendrás todos tus beneficios PRO hasta la fecha de vencimiento.`, 'info');
                }
                return;
            }

            this.userPlan = {
                isPro: false,
                planName: 'PLAN GRATUITO',
                paymentStatus: 'UNPAID',
                subscribedAt: null,
                expiresAt: null,
                lastPaymentMethod: null
            };
            localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
            if (this.currentUser) this.saveUserProfileToCloud(this.currentUser);
            this.updateUI();
            this.applyPlanRestrictions();
            this.closeModal('modal-pricing');
            if (typeof showToast === 'function') {
                showToast('Has cambiado al Plan Gratuito.', 'info');
            }
        }
    },

    checkPlanExpiration() {
        if (this.isAdminUser()) {
            this.userPlan = {
                isPro: true,
                planName: 'PLAN ADMIN PRO 👑',
                paymentStatus: 'ADMIN_FREE',
                subscribedAt: '2026-01-01T00:00:00.000Z',
                expiresAt: '2099-12-31',
                lastPaymentMethod: 'Acceso Administrador'
            };
            return;
        }
        if (this.userPlan && this.userPlan.isPro && this.userPlan.expiresAt) {
            const today = new Date().toISOString().split('T')[0];
            if (today > this.userPlan.expiresAt) {
                console.log(`AuthSubscription: Plan PRO venció el ${this.userPlan.expiresAt}. Reconvirtiendo a Plan Gratuito.`);
                this.userPlan = {
                    isPro: false,
                    planName: 'PLAN GRATUITO',
                    paymentStatus: 'EXPIRED',
                    subscribedAt: this.userPlan.subscribedAt || null,
                    expiresAt: null,
                    expiredAt: today
                };
                localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
                if (this.currentUser) this.saveUserProfileToCloud(this.currentUser);
                this.updateUI();
                this.applyPlanRestrictions();
                if (typeof showToast === 'function') {
                    showToast('⚠️ Tu suscripción Plan PRO mensual ha vencido. Por favor renueva tu plan para continuar.', 'warning');
                }
            }
        }
    },

    checkUrlPaymentReturn() {
        try {
            if (typeof window !== 'undefined' && typeof URLSearchParams !== 'undefined' && window.location && window.location.search) {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('payment_success') || urlParams.get('status') === 'approved' || urlParams.get('plan') === 'pro' || urlParams.has('token')) {
                    this.setPlan('pro', 1);
                    if (typeof showToast === 'function') {
                        showToast('🎉 ¡Pago procesado con éxito en Flow/Webpay! Tu Plan PRO Mensual se activó por 30 días.', 'success');
                    }
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }
            }
        } catch (e) {
            console.log('Error checking payment return URL:', e);
        }
    },

    checkPendingPaymentAfterAuth() {
        if (this.pendingPaymentAfterAuth && this.currentUser) {
            this.pendingPaymentAfterAuth = false;
            setTimeout(() => {
                if (typeof showToast === 'function') {
                    showToast('✅ ¡Sesión iniciada con éxito! Redirigiendo a las opciones de pago...', 'success');
                }
                if (typeof PaymentsModule !== 'undefined' && PaymentsModule.showPaymentModal) {
                    PaymentsModule.showPaymentModal();
                } else {
                    this.showPricingModal();
                }
            }, 500);
        }
    },

    signUpWithEmail(email, password) {
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    this.currentUser = cred.user;
                    this.setPlan('free');
                    this.saveUserProfileToCloud(cred.user);
                    showToast(`¡Cuenta registrada con éxito en Firebase! Bienvenido/a ${cred.user.email}`, 'success');
                    this.closeModal('modal-auth');
                    this.checkPendingPaymentAfterAuth();
                })
                .catch(err => {
                    let msg = err.message;
                    if (err.code === 'auth/email-already-in-use') {
                        msg = 'Este correo ya está registrado en Firebase. Haz clic abajo en "¿Ya tienes cuenta? Inicia Sesión" para ingresar.';
                    } else if (err.code === 'auth/weak-password') {
                        msg = 'La contraseña debe tener al menos 6 caracteres.';
                    }
                    showToast(`Error al crear cuenta: ${msg}`, 'error');
                });
        } else {
            // Local Demo Session - Starts on Free Plan
            this.currentUser = { email: email, displayName: email.split('@')[0], uid: 'user_' + Date.now() };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            this.setPlan('free');
            showToast(`¡Cuenta creada con éxito! Estás en el Plan Gratuito.`, 'success');
            this.closeModal('modal-auth');
            this.checkPendingPaymentAfterAuth();
        }
    },

    signInWithEmail(email, password) {
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(cred => {
                    this.currentUser = cred.user;
                    this.loadUserData(cred.user);
                    showToast(`Sesión iniciada correctamente como ${cred.user.email}`, 'success');
                    this.closeModal('modal-auth');
                    this.checkPendingPaymentAfterAuth();
                })
                .catch(err => {
                    let msg = err.message;
                    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                        msg = 'Correo o contraseña incorrectos. Si no tienes cuenta, haz clic en "¿No tienes cuenta? Regístrate aquí".';
                    }
                    showToast(`Error de inicio de sesión: ${msg}`, 'error');
                });
        } else {
            // Local Demo Session
            this.currentUser = { email: email, displayName: email.split('@')[0], uid: 'user_' + Date.now() };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            this.updateUI();
            this.applyPlanRestrictions();
            showToast(`Sesión iniciada correctamente`, 'success');
            this.closeModal('modal-auth');
            this.checkPendingPaymentAfterAuth();
        }
    },

    signInWithGoogle() {
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(result => {
                    this.currentUser = result.user;
                    this.loadUserData(result.user);
                    showToast(`Bienvenido/a ${result.user.displayName}`, 'success');
                    this.closeModal('modal-auth');
                    this.checkPendingPaymentAfterAuth();
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
            this.checkPendingPaymentAfterAuth();
        }
    },

    saveUserProfileToCloud(user) {
        if (typeof firebase !== 'undefined' && firebase.firestore && user) {
            try {
                const db = firebase.firestore();
                db.collection('users').doc(user.uid).set({
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    plan: this.userPlan,
                    subscriptionAudit: {
                        isPro: !!this.userPlan.isPro,
                        planName: this.userPlan.planName || 'PLAN GRATUITO',
                        paymentStatus: this.userPlan.paymentStatus || (this.userPlan.isPro ? 'PAID' : 'UNPAID'),
                        subscribedAt: this.userPlan.subscribedAt || null,
                        expiresAt: this.userPlan.expiresAt || null,
                        lastPaymentMethod: this.userPlan.lastPaymentMethod || null,
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                console.log('AuthSubscription: User subscription profile synced to Cloud Firestore.');
            } catch (e) {
                console.log('Error saving user profile to Cloud:', e);
            }
        }
    },

    signOut() {
        if (typeof StorageManager !== 'undefined' && StorageManager.clearAllSessionData) {
            StorageManager.clearAllSessionData();
        }
        if (!this.isDemoConfig() && typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().then(() => {
                showToast('Sesión cerrada correctamente', 'info');
                this.closeModal('modal-account');
                this.currentUser = null;
                window.location.reload();
            });
        } else {
            this.currentUser = null;
            showToast('Sesión cerrada correctamente', 'info');
            this.closeModal('modal-account');
            window.location.reload();
        }
    },

    loadUserData(user) {
        if (this.isAdminUser()) {
            this.userPlan = { isPro: true, planName: 'PLAN ADMIN PRO 👑', expiresAt: '2099-12-31' };
            localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
            this.updateUI();
            this.applyPlanRestrictions();
            if (typeof CloudSync !== 'undefined' && CloudSync.syncAllOnLogin) {
                CloudSync.syncAllOnLogin();
            }
            return;
        }
        if (typeof firebase !== 'undefined' && firebase.firestore && user) {
            try {
                const db = firebase.firestore();
                db.collection('users').doc(user.uid).get().then(doc => {
                    if (doc.exists && doc.data().plan) {
                        this.userPlan = doc.data().plan;
                        localStorage.setItem('emitia_user_plan', JSON.stringify(this.userPlan));
                    } else {
                        this.saveUserProfileToCloud(user);
                    }
                    this.updateUI();
                    this.applyPlanRestrictions();
                }).catch(e => {
                    this.updateUI();
                    this.applyPlanRestrictions();
                });
            } catch (e) {
                this.updateUI();
                this.applyPlanRestrictions();
            }
        } else {
            this.updateUI();
            this.applyPlanRestrictions();
        }

        if (typeof CloudSync !== 'undefined' && CloudSync.syncAllOnLogin) {
            CloudSync.syncAllOnLogin();
        }
    },

    updateUI() {
        const btnAuth = document.getElementById('btn-auth-user');
        const badgePlan = document.getElementById('user-plan-badge');

        if (btnAuth) {
            if (this.currentUser) {
                const uName = this.currentUser.username || this.currentUser.displayName || this.currentUser.email.split('@')[0];
                btnAuth.innerHTML = `<i class="fa-solid fa-circle-user" style="color:#10b981;"></i> <span>${uName}</span>`;
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

        const navAdminBtn = document.getElementById('btn-nav-admin-panel');
        if (navAdminBtn) {
            navAdminBtn.style.display = this.isAdminUser() ? 'inline-flex' : 'none';
        }
    },

    applyPlanRestrictions() {
        try {
            // 1. Templates Available (Free has 'modern', PRO templates 2-8 show 🔒 (Plan PRO))
            const templateSelect = document.getElementById('doc-template');
            if (templateSelect && templateSelect.options) {
                const currentVal = templateSelect.value;
                Array.from(templateSelect.options).forEach(opt => {
                    let baseText = opt.textContent.replace(' 🔒 (Plan PRO)', '').trim();
                    if (!this.userPlan.isPro && opt.value !== 'modern') {
                        opt.textContent = `${baseText} 🔒 (Plan PRO)`;
                    } else {
                        opt.textContent = baseText;
                    }
                });
                if (currentVal) templateSelect.value = currentVal;
            }

            // 2. Multi-Language Restriction (Spanish only for Free, EN/PT/etc for PRO)
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

            // 4. PDF, Print, CSV & Email Action Buttons Lock Indicators
            const btnPrintDirect = document.getElementById('btn-print-direct');
            if (btnPrintDirect) {
                btnPrintDirect.innerHTML = this.userPlan.isPro 
                    ? '<i class="fa-solid fa-print"></i> Imprimir / PDF'
                    : '<i class="fa-solid fa-lock"></i> Imprimir / PDF 🔒';
            }

            const btnCsv = document.getElementById('btn-export-csv');
            if (btnCsv) {
                btnCsv.innerHTML = this.userPlan.isPro 
                    ? '<i class="fa-solid fa-file-csv"></i> CSV'
                    : '<i class="fa-solid fa-lock"></i> CSV 🔒';
            }

            const btnEmail = document.getElementById('btn-send-email');
            if (btnEmail) {
                btnEmail.innerHTML = this.userPlan.isPro 
                    ? '<i class="fa-solid fa-envelope"></i> Email'
                    : '<i class="fa-solid fa-lock"></i> Email 🔒';
            }

            // 5. Watermark Control Restriction
            const watermarkSelect = document.getElementById('doc-watermark');
            if (watermarkSelect) {
                if (this.userPlan.isPro) {
                    watermarkSelect.disabled = false;
                    watermarkSelect.title = "Selecciona una marca de agua";
                } else {
                    watermarkSelect.disabled = true;
                    watermarkSelect.title = "Marcas de agua personalizadas solo disponibles en PLAN PRO 🔒";
                }
                if (typeof EditorModule !== 'undefined' && EditorModule.recalculateAndRender) {
                    EditorModule.recalculateAndRender();
                }
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
            const emailElem = document.getElementById('modal-account-email');
            if (emailElem) emailElem.textContent = this.currentUser ? this.currentUser.email : 'usuario@emitia.pro';

            const userDisplayName = (this.currentUser && (this.currentUser.username || this.currentUser.displayName)) 
                ? (this.currentUser.username || this.currentUser.displayName) 
                : (this.currentUser ? this.currentUser.email.split('@')[0] : 'usuario');

            const nameView = document.getElementById('modal-account-display-name-view');
            if (nameView) nameView.textContent = userDisplayName;

            const usernameInput = document.getElementById('modal-account-input-username');
            if (usernameInput) usernameInput.value = userDisplayName;

            const avatarInitials = document.getElementById('modal-account-avatar-initials');
            if (avatarInitials) {
                avatarInitials.textContent = userDisplayName.substring(0, 2).toUpperCase();
            }

            const feedback = document.getElementById('username-feedback');
            if (feedback) {
                feedback.textContent = '💡 Tu nombre de usuario identifica tu cuenta y figurará en la aplicación.';
                feedback.style.color = '#64748b';
            }

            const btnAdmin = document.getElementById('btn-open-admin-panel');
            if (btnAdmin) {
                btnAdmin.style.display = this.isAdminUser() ? 'inline-flex' : 'none';
            }

            modal.classList.remove('hidden');
        }
    },

    async saveUsernameProfile() {
        const input = document.getElementById('modal-account-input-username');
        const feedback = document.getElementById('username-feedback');
        if (!input) return;

        let rawVal = input.value.trim().replace(/^@/, '');
        const username = rawVal.replace(/[^a-zA-Z0-9_]/g, '');

        if (!username || username.length < 3) {
            if (typeof showToast === 'function') {
                showToast('⚠️ El nombre de usuario debe tener al menos 3 caracteres (letras, números y guiones bajos).', 'warning');
            }
            if (feedback) {
                feedback.textContent = '❌ Mínimo 3 caracteres (solo letras, números o _).';
                feedback.style.color = '#ef4444';
            }
            input.style.borderColor = '#ef4444';
            return;
        }

        const usernameLower = username.toLowerCase();
        const oldUsername = (this.currentUser && this.currentUser.username) ? this.currentUser.username : null;
        const oldUsernameLower = oldUsername ? oldUsername.toLowerCase() : null;
        const currentUid = this.currentUser ? (this.currentUser.uid || this.currentUser.email) : 'guest';

        // If the username hasn't changed, simply inform the user
        if (oldUsernameLower && oldUsernameLower === usernameLower) {
            if (typeof showToast === 'function') showToast('ℹ️ El nombre de usuario no ha cambiado.', 'info');
            return;
        }

        if (typeof showToast === 'function') showToast('Verificando disponibilidad de usuario...', 'info');

        let isTaken = false;
        let isCloudAvailable = false;

        // 1. Check availability in Firestore cloud database
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                const db = firebase.firestore();
                const snap = await db.collection('usernames').doc(usernameLower).get();
                if (snap.exists) {
                    const data = snap.data();
                    if (data && data.uid && data.uid !== currentUid) {
                        isTaken = true;
                    }
                }
                isCloudAvailable = true;
            } catch (e) {
                console.log('Error checking username in Firestore:', e);
            }
        }

        // 2. Check availability in local registry as well
        const registryKey = 'emitia_registered_usernames';
        const registry = JSON.parse(localStorage.getItem(registryKey) || '{}');
        if (registry[usernameLower] && registry[usernameLower] !== currentUid) {
            isTaken = true;
        }

        if (isTaken) {
            if (typeof showToast === 'function') {
                showToast(`⚠️ El nombre de usuario '${username}' ya se encuentra registrado por otro usuario. Por favor elige otro.`, 'error');
            }
            if (feedback) {
                feedback.textContent = `❌ '${username}' ya está registrado por otro usuario. Elige un nombre distinto.`;
                feedback.style.color = '#ef4444';
            }
            input.style.borderColor = '#ef4444';
            return;
        }

        // 3. Clean up previous username entries in local registry
        for (const key in registry) {
            if (registry[key] === currentUid && key !== usernameLower) {
                delete registry[key];
            }
        }
        registry[usernameLower] = currentUid;
        localStorage.setItem(registryKey, JSON.stringify(registry));

        if (this.currentUser) {
            this.currentUser.username = username;
            this.currentUser.displayName = username;

            const savedDemo = localStorage.getItem('emitia_demo_user');
            if (savedDemo) {
                try {
                    const parsed = JSON.parse(savedDemo);
                    parsed.username = username;
                    parsed.displayName = username;
                    localStorage.setItem('emitia_demo_user', JSON.stringify(parsed));
                } catch (e) {}
            }
        }

        // 4. Update Firestore: Delete old username document and save only current username document
        if (isCloudAvailable && typeof firebase !== 'undefined' && firebase.firestore && this.currentUser && this.currentUser.uid) {
            try {
                const db = firebase.firestore();

                // Delete previous username doc if changed
                if (oldUsernameLower && oldUsernameLower !== usernameLower) {
                    await db.collection('usernames').doc(oldUsernameLower).delete().catch(e => console.log('Old username delete info:', e));
                }

                // Delete any old orphaned username docs for this UID to keep usernames collection 1:1 clean
                try {
                    const userOldDocs = await db.collection('usernames').where('uid', '==', this.currentUser.uid).get();
                    userOldDocs.forEach(async (doc) => {
                        if (doc.id !== usernameLower) {
                            await doc.ref.delete().catch(() => {});
                        }
                    });
                } catch (e) {}

                // Save new username doc
                await db.collection('usernames').doc(usernameLower).set({
                    username: username,
                    uid: this.currentUser.uid,
                    email: this.currentUser.email || '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Update user document
                await db.collection('users').doc(this.currentUser.uid).set({
                    username: username,
                    displayName: username
                }, { merge: true });
            } catch (err) {
                console.log('Error updating username in cloud:', err);
            }
        }

        input.style.borderColor = '#10b981';
        if (feedback) {
            feedback.textContent = `✅ ¡Nombre de usuario '${username}' actualizado y guardado con éxito!`;
            feedback.style.color = '#10b981';
        }
        if (typeof showToast === 'function') {
            showToast(`✅ ¡Nombre de usuario '${username}' actualizado con éxito!`, 'success');
        }

        const nameView = document.getElementById('modal-account-display-name-view');
        if (nameView) nameView.textContent = username;

        this.updateUI();
    },

    showPricingModal() {
        const modal = document.getElementById('modal-pricing');
        if (modal) modal.classList.remove('hidden');
    },

    showAdminPanel() {
        if (!this.isAdminUser()) {
            return;
        }
        const modal = document.getElementById('modal-admin-panel');
        if (modal) {
            const diagUser = document.getElementById('admin-diag-user');
            if (diagUser) diagUser.textContent = `${this.currentUser.email} (${this.currentUser.uid})`;

            if (typeof PaymentsModule !== 'undefined' && PaymentsModule.updateEnvironmentUI) {
                PaymentsModule.updateEnvironmentUI();
            }
            modal.classList.remove('hidden');
        }
    },

    toggleAuthMode() {
        const isRegisterInput = document.getElementById('modal-auth-is-register');
        const title = document.getElementById('modal-auth-title');
        const submitBtn = document.getElementById('modal-auth-submit');
        const toggleBtn = document.getElementById('btn-toggle-auth-mode');

        if (isRegisterInput.value === 'true') {
            isRegisterInput.value = 'false';
            title.innerHTML = '<i class="fa-solid fa-right-to-bracket" style="color: #818cf8;"></i> Iniciar Sesión';
            submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> <span>Ingresar a Emitia Pro</span>';
            toggleBtn.textContent = '¿No tienes cuenta? Regístrate aquí';
        } else {
            isRegisterInput.value = 'true';
            title.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #818cf8;"></i> Crear Cuenta Pro';
            submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> <span>Registrarse Gratis</span>';
            toggleBtn.textContent = '¿Ya tienes cuenta? Inicia sesión aquí';
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
