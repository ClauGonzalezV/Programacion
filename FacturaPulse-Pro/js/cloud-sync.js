/* ==========================================================================
   EMITIA PRO - FIRESTORE CLOUD DATA SYNCHRONIZATION MODULE
   Syncs Documents, Clients, and Catalog across all devices via Cloud Firestore
   ========================================================================== */

const CloudSync = {
    enableOfflinePersistence() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                firebase.firestore().enablePersistence({ synchronizeTabs: true })
                    .then(() => console.log('CloudSync: Firestore offline persistence enabled (IndexedDB).'))
                    .catch(err => console.log('CloudSync persistence info:', err.code));
            } catch (e) {}
        }
    },

    get db() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try { return firebase.firestore(); } catch (e) { return null; }
        }
        return null;
    },

    get userUid() {
        if (typeof AuthSubscription !== 'undefined' && AuthSubscription.currentUser) {
            return AuthSubscription.currentUser.uid || AuthSubscription.currentUser.email;
        }
        return null;
    },

    // 1. Sync Document to Firestore Cloud
    async syncDocument(docData) {
        const uid = this.userUid;
        if (!uid || !this.db) {
            console.log('CloudSync: Local mode (no cloud user session)');
            return;
        }

        try {
            const docId = docData.number || `DOC_${Date.now()}`;
            await this.db.collection('users').doc(uid).collection('documents').doc(docId).set({
                ...docData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`CloudSync: Document ${docId} synced to cloud.`);
        } catch (err) {
            console.log('CloudSync document sync info:', err.message);
        }
    },

    // 2. Fetch History from Cloud
    async fetchHistory() {
        const uid = this.userUid;
        if (!uid || !this.db) return null;

        try {
            const snapshot = await this.db.collection('users').doc(uid).collection('documents').orderBy('updatedAt', 'desc').get();
            const cloudDocs = [];
            snapshot.forEach(doc => cloudDocs.push(doc.data()));
            return cloudDocs;
        } catch (err) {
            console.log('CloudSync fetch history info:', err.message);
            return null;
        }
    },

    // 3. Sync Client to Firestore Cloud
    async syncClient(clientData) {
        const uid = this.userUid;
        if (!uid || !this.db) return;

        try {
            const clientId = clientData.taxId || clientData.name ? clientData.name.replace(/[^a-zA-Z0-9]/g, '_') : `CLIENT_${Date.now()}`;
            await this.db.collection('users').doc(uid).collection('clients').doc(clientId).set({
                ...clientData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`CloudSync: Client ${clientId} synced to cloud.`);
        } catch (err) {
            console.log('CloudSync client sync info:', err.message);
        }
    },

    // 4. Fetch Clients from Cloud
    async fetchClients() {
        const uid = this.userUid;
        if (!uid || !this.db) return null;

        try {
            const snapshot = await this.db.collection('users').doc(uid).collection('clients').get();
            const cloudClients = [];
            snapshot.forEach(doc => cloudClients.push(doc.data()));
            return cloudClients;
        } catch (err) {
            console.log('CloudSync fetch clients info:', err.message);
            return null;
        }
    },

    // 5. Sync Catalog Item to Cloud
    async syncCatalogItem(itemData) {
        const uid = this.userUid;
        if (!uid || !this.db) return;

        try {
            const itemId = itemData.description ? itemData.description.replace(/[^a-zA-Z0-9]/g, '_') : `ITEM_${Date.now()}`;
            await this.db.collection('users').doc(uid).collection('catalog').doc(itemId).set({
                ...itemData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`CloudSync: Item ${itemId} synced to cloud.`);
        } catch (err) {
            console.log('CloudSync catalog sync info:', err.message);
        }
    },

    // 6. Fetch Catalog from Cloud
    async fetchCatalog() {
        const uid = this.userUid;
        if (!uid || !this.db) return null;

        try {
            const snapshot = await this.db.collection('users').doc(uid).collection('catalog').get();
            const cloudCatalog = [];
            snapshot.forEach(doc => cloudCatalog.push(doc.data()));
            return cloudCatalog;
        } catch (err) {
            console.log('CloudSync fetch catalog info:', err.message);
            return null;
        }
    },

    // 7. Full Sync on Login (Merges local data into cloud and pulls cloud data)
    async syncAllOnLogin() {
        const uid = this.userUid;
        if (!uid) return;

        if (typeof showToast === 'function') {
            showToast('Sincronizando datos con tu cuenta Cloud...', 'info');
        }

        // Pull cloud history
        const cloudDocs = await this.fetchHistory();
        if (cloudDocs && cloudDocs.length > 0) {
            localStorage.setItem(StorageManager.KEYS.HISTORY, JSON.stringify(cloudDocs));
            if (typeof App !== 'undefined' && App.renderHistoryTab) {
                App.renderHistoryTab();
                App.updateHistoryBadge();
            }
        } else {
            // Push local history to cloud
            const localHistory = StorageManager.getHistory();
            localHistory.forEach(doc => this.syncDocument(doc));
        }

        // Pull cloud clients
        const cloudClients = await this.fetchClients();
        if (cloudClients && cloudClients.length > 0) {
            localStorage.setItem(StorageManager.KEYS.CLIENTS, JSON.stringify(cloudClients));
        } else {
            const localClients = StorageManager.getClients();
            localClients.forEach(c => this.syncClient(c));
        }

        // Pull cloud catalog
        const cloudCatalog = await this.fetchCatalog();
        if (cloudCatalog && cloudCatalog.length > 0) {
            localStorage.setItem(StorageManager.KEYS.CATALOG, JSON.stringify(cloudCatalog));
        } else {
            const localCatalog = StorageManager.getCatalog();
            localCatalog.forEach(i => this.syncCatalogItem(i));
        }
    }
};
