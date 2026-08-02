/* ==========================================================================
   STORAGE MODULE - LOCALSTORAGE MANAGER & SEED DATA
   ========================================================================== */

const StorageManager = {
    KEYS: {
        CLIENTS: 'facturapulse_clients',
        CATALOG: 'facturapulse_catalog',
        HISTORY: 'facturapulse_history',
        EMITTER: 'facturapulse_emitter_profile',
        SETTINGS: 'facturapulse_settings'
    },

    // Initialize seed data if empty
    clearAllSessionData() {
        localStorage.removeItem(this.KEYS.CLIENTS);
        localStorage.removeItem(this.KEYS.CATALOG);
        localStorage.removeItem(this.KEYS.HISTORY);
        localStorage.removeItem(this.KEYS.EMITTER);
        localStorage.removeItem('emitia_user_plan');
        localStorage.removeItem('emitia_demo_user');
        localStorage.removeItem('facturapulse_counters');
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('facturapulse_counters')) {
                localStorage.removeItem(key);
            }
        });
    },

    init() {
        const isInitialized = localStorage.getItem('facturapulse_initialized');

        if (!isInitialized) {
            if (!localStorage.getItem(this.KEYS.CLIENTS)) {
                const seedClients = [
                    {
                        id: 'cli-1',
                        name: 'Innova Tech Solutions SpA',
                        taxId: '76.890.123-5',
                        email: 'contacto@innovatech.cl',
                        phone: '+56 9 7654 3210',
                        address: 'Av. Andrés Bello 2457, Of. 1002, Providencia, Santiago'
                    },
                    {
                        id: 'cli-2',
                        name: 'Comercial & Logística Del Sur',
                        taxId: '89.123.456-K',
                        email: 'compras@delsur.cl',
                        phone: '+56 9 8811 2233',
                        address: 'Calle O\'Higgins 450, Concepción'
                    }
                ];
                this.saveClients(seedClients);
            }

            if (!localStorage.getItem(this.KEYS.CATALOG)) {
                const seedCatalog = [
                    { id: 'cat-1', name: 'Diseño y Desarrollo de Sitio Web Corporativo', price: 1200 },
                    { id: 'cat-2', name: 'Mantenimiento Mensual y Servidor Cloud', price: 150 },
                    { id: 'cat-3', name: 'Optimización SEO y Posicionamiento Google', price: 450 },
                    { id: 'cat-4', name: 'Integración de Pasarela de Pagos (Stripe/Webpay)', price: 300 },
                    { id: 'cat-5', name: 'Consultoría en UI/UX y Arquitectura Web', price: 80 }
                ];
                this.saveCatalog(seedCatalog);
            }

            if (!localStorage.getItem(this.KEYS.HISTORY)) {
                this.saveHistory([]);
            }

            localStorage.setItem('facturapulse_initialized', 'true');
        }
    },

    // --- CLIENTS ---
    getClients() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.CLIENTS)) || [];
        } catch {
            return [];
        }
    },

    saveClients(clients) {
        localStorage.setItem(this.KEYS.CLIENTS, JSON.stringify(clients));
    },

    addClient(client) {
        const clients = this.getClients();
        client.id = 'cli-' + Date.now();
        clients.push(client);
        this.saveClients(clients);
        if (typeof CloudSync !== 'undefined' && CloudSync.syncClient) {
            CloudSync.syncClient(client);
        }
        return client;
    },

    deleteClient(id) {
        let clients = this.getClients();
        const clientToDelete = clients.find(c => c.id === id);
        clients = clients.filter(c => c.id !== id);
        this.saveClients(clients);
        if (typeof CloudSync !== 'undefined' && CloudSync.deleteClient) {
            CloudSync.deleteClient(id, clientToDelete ? clientToDelete.name : '');
        }
    },

    // --- CATALOG ---
    getCatalog() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.CATALOG)) || [];
        } catch {
            return [];
        }
    },

    saveCatalog(catalog) {
        localStorage.setItem(this.KEYS.CATALOG, JSON.stringify(catalog));
    },

    addCatalogItem(item) {
        const catalog = this.getCatalog();
        item.id = 'cat-' + Date.now();
        catalog.push(item);
        this.saveCatalog(catalog);
        if (typeof CloudSync !== 'undefined' && CloudSync.syncCatalogItem) {
            CloudSync.syncCatalogItem(item);
        }
        return item;
    },

    deleteCatalogItem(id) {
        let catalog = this.getCatalog();
        const itemToDelete = catalog.find(i => i.id === id);
        catalog = catalog.filter(i => i.id !== id);
        this.saveCatalog(catalog);
        if (typeof CloudSync !== 'undefined' && CloudSync.deleteCatalogItem) {
            CloudSync.deleteCatalogItem(id, itemToDelete ? itemToDelete.name : '');
        }
    },

    // --- HISTORY ---
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.HISTORY)) || [];
        } catch {
            return [];
        }
    },

    saveHistory(history) {
        localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
    },

    saveDocumentToHistory(docData) {
        const history = this.getHistory();
        const existingIndex = history.findIndex(h => h.number === docData.number);
        docData.savedAt = new Date().toISOString();
        
        if (existingIndex >= 0) {
            history[existingIndex] = docData;
        } else {
            history.unshift(docData);
        }
        this.saveHistory(history);

        if (typeof CloudSync !== 'undefined' && CloudSync.syncDocument) {
            CloudSync.syncDocument(docData);
        }
    },

    deleteHistoryDocument(number) {
        let history = this.getHistory();
        history = history.filter(h => h.number !== number);
        this.saveHistory(history);
        if (typeof CloudSync !== 'undefined' && CloudSync.deleteDocument) {
            CloudSync.deleteDocument(number);
        }
    },

    clearHistory() {
        this.saveHistory([]);
        if (typeof CloudSync !== 'undefined' && CloudSync.clearHistory) {
            CloudSync.clearHistory();
        }
        if (typeof EditorModule !== 'undefined' && EditorModule.getUserCounterKey) {
            const key = EditorModule.getUserCounterKey();
            localStorage.removeItem(key);
            if (EditorModule.autoSetDocNumber) EditorModule.autoSetDocNumber();
        }
    },

    // --- EMITTER PROFILE ---
    getEmitterProfile() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.EMITTER)) || null;
        } catch {
            return null;
        }
    },

    saveEmitterProfile(profile) {
        localStorage.setItem(this.KEYS.EMITTER, JSON.stringify(profile));
    },

    // --- BACKUP & RESTORE ---
    exportBackupJSON() {
        const backup = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            clients: this.getClients(),
            catalog: this.getCatalog(),
            history: this.getHistory(),
            emitter: this.getEmitterProfile()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FacturaPulse_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importBackupJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (Array.isArray(data.clients)) {
                this.saveClients(data.clients);
                if (typeof CloudSync !== 'undefined' && CloudSync.syncClient) {
                    data.clients.forEach(c => CloudSync.syncClient(c));
                }
            }
            if (Array.isArray(data.catalog)) {
                this.saveCatalog(data.catalog);
                if (typeof CloudSync !== 'undefined' && CloudSync.syncCatalogItem) {
                    data.catalog.forEach(item => CloudSync.syncCatalogItem(item));
                }
            }
            if (Array.isArray(data.history)) {
                this.saveHistory(data.history);
                if (typeof CloudSync !== 'undefined' && CloudSync.syncDocument) {
                    data.history.forEach(doc => CloudSync.syncDocument(doc));
                }
            }
            if (data.emitter) {
                this.saveEmitterProfile(data.emitter);
            }
            return { success: true };
        } catch (err) {
            console.error('Error al importar backup JSON:', err);
            return { success: false, error: err.message };
        }
    }
};

StorageManager.init();
