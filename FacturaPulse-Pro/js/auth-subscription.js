/* ==========================================================================
   EMITIA PRO - FIREBASE AUTHENTICATION & SUBSCRIPTION MODULE
   ========================================================================== */

const AuthSubscription = {
    // Config Placeholder - Pre-configured for local & production
    firebaseConfig: {
        apiKey: "AIzaSyDemoKeyEmitiaProForDevelopmentOnly12345",
        authDomain: "emitia-pro.firebaseapp.com",
        projectId: "emitia-pro",
        storageBucket: "emitia-pro.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:demoappid123456"
    },

    currentUser: null,
    userPlan: { isPro: true, planName: 'PLAN PRO (Demo)', expiresAt: null },

    init() {
        // Initialize Firebase if compat SDK is loaded
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            try {
                firebase.initializeApp(this.firebaseConfig);
                this.bindFirebaseEvents();
            } catch (err) {
                console.log('Firebase init demo mode:', err);
            }
        }
        this.bindUIEvents();
        this.updateUI();
    },

    bindFirebaseEvents() {
        if (typeof firebase === 'undefined' || !firebase.auth) return;

        firebase.auth().onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                this.loadUserData(user);
            } else {
                this.userPlan = { isPro: false, planName: 'PLAN GRATUITO', expiresAt: null };
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
    },

    signUpWithEmail(email, password) {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    showToast(`¡Cuenta creada con éxito! Bienvenido ${cred.user.email}`, 'success');
                    this.closeModal('modal-auth');
                })
                .catch(err => {
                    showToast(`Error al crear cuenta: ${err.message}`, 'error');
                });
        } else {
            // Local Demo Fallback
            this.currentUser = { email: email, displayName: email.split('@')[0] };
            this.userPlan = { isPro: true, planName: 'PLAN PRO (Demo)', expiresAt: null };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            showToast(`¡Bienvenido/a a Emitia Pro, ${email}!`, 'success');
            this.closeModal('modal-auth');
            this.updateUI();
        }
    },

    signInWithEmail(email, password) {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(cred => {
                    showToast(`Sesión iniciada como ${cred.user.email}`, 'success');
                    this.closeModal('modal-auth');
                })
                .catch(err => {
                    showToast(`Error de inicio de sesión: ${err.message}`, 'error');
                });
        } else {
            // Local Demo Fallback
            this.currentUser = { email: email, displayName: email.split('@')[0] };
            this.userPlan = { isPro: true, planName: 'PLAN PRO (Demo)', expiresAt: null };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            showToast(`Sesión iniciada correctamente`, 'success');
            this.closeModal('modal-auth');
            this.updateUI();
        }
    },

    signInWithGoogle() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(result => {
                    showToast(`Bienvenido/a ${result.user.displayName}`, 'success');
                    this.closeModal('modal-auth');
                })
                .catch(err => {
                    showToast(`Error con Google Auth: ${err.message}`, 'error');
                });
        } else {
            // Demo Google Auth
            this.currentUser = { email: 'demo@emitia.pro', displayName: 'Usuario Demo Google', photoURL: '' };
            this.userPlan = { isPro: true, planName: 'PLAN PRO (Demo)', expiresAt: null };
            localStorage.setItem('emitia_demo_user', JSON.stringify(this.currentUser));
            showToast(`Sesión iniciada con Google Demo`, 'success');
            this.closeModal('modal-auth');
            this.updateUI();
        }
    },

    signOut() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().then(() => {
                showToast('Sesión cerrada', 'info');
                this.closeModal('modal-account');
                this.updateUI();
            });
        } else {
            this.currentUser = null;
            this.userPlan = { isPro: false, planName: 'PLAN GRATUITO', expiresAt: null };
            localStorage.removeItem('emitia_demo_user');
            showToast('Sesión cerrada', 'info');
            this.closeModal('modal-account');
            this.updateUI();
        }
    },

    loadUserData(user) {
        // Load Plan Status from Firestore or Default
        this.userPlan = { isPro: true, planName: 'PLAN PRO ACTIVO', expiresAt: '2026-12-31' };
        this.updateUI();
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

    showLoginModal() {
        const modal = document.getElementById('modal-auth');
        if (modal) modal.classList.remove('hidden');
    },

    showAccountModal() {
        const modal = document.getElementById('modal-account');
        if (modal) {
            document.getElementById('modal-account-email').textContent = this.currentUser ? this.currentUser.email : '';
            document.getElementById('modal-account-plan').textContent = this.userPlan.planName;
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

// Check local demo user on load
document.addEventListener('DOMContentLoaded', () => {
    const savedDemo = localStorage.getItem('emitia_demo_user');
    if (savedDemo) {
        try {
            AuthSubscription.currentUser = JSON.parse(savedDemo);
            AuthSubscription.userPlan = { isPro: true, planName: 'PLAN PRO (Demo)', expiresAt: null };
        } catch (e) {}
    }
    AuthSubscription.init();
});
