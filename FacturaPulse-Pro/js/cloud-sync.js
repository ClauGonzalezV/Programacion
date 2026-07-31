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

    async deleteDocument(docId) {
        const uid = this.userUid;
        if (!uid || !this.db) return;
        try {
            await this.db.collection('users').doc(uid).collection('documents').doc(docId).delete();
            console.log(`CloudSync: Document ${docId} deleted from cloud.`);
        } catch (err) {
            console.log('CloudSync document delete info:', err.message);
        }
    },

    async clearHistory() {
        const uid = this.userUid;
        if (!uid || !this.db) return;
        try {
            const snapshot = await this.db.collection('users').doc(uid).collection('documents').get();
            const batch = this.db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log('CloudSync: All history documents deleted from cloud.');
        } catch (err) {
            console.log('CloudSync clear history info:', err.message);
        }
    },

    // 2. Fetch History from Cloud
    async fetchHistory() {
        const uid = this.userUid;
        if (!uid || !this.db) return null;

        try {
            const snapshot = await this.db.collection('users').doc(uid).collection('documents').get();
            const cloudDocs = [];
            snapshot.forEach(doc => cloudDocs.push(doc.data()));
            cloudDocs.sort((a, b) => (b.number || '').localeCompare(a.number || ''));
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
            const clientId = clientData.id || (clientData.taxId || clientData.name ? clientData.name.replace(/[^a-zA-Z0-9]/g, '_') : `CLIENT_${Date.now()}`);
            await this.db.collection('users').doc(uid).collection('clients').doc(clientId).set({
                ...clientData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`CloudSync: Client ${clientId} synced to cloud.`);
        } catch (err) {
            console.log('CloudSync client sync info:', err.message);
        }
    },

    // Delete Client from Firestore Cloud
    async deleteClient(clientId) {
        const uid = this.userUid;
        if (!uid || !this.db || !clientId) return;

        try {
            await this.db.collection('users').doc(uid).collection('clients').doc(clientId).delete();
            console.log(`CloudSync: Client ${clientId} deleted from cloud.`);
        } catch (err) {
            console.log('CloudSync delete client info:', err.message);
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
            const itemId = itemData.id || (itemData.name ? itemData.name.replace(/[^a-zA-Z0-9]/g, '_') : `ITEM_${Date.now()}`);
            await this.db.collection('users').doc(uid).collection('catalog').doc(itemId).set({
                ...itemData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`CloudSync: Item ${itemId} synced to cloud.`);
        } catch (err) {
            console.log('CloudSync catalog sync info:', err.message);
        }
    },

    // Delete Catalog Item from Firestore Cloud
    async deleteCatalogItem(itemId) {
        const uid = this.userUid;
        if (!uid || !this.db || !itemId) return;

        try {
            await this.db.collection('users').doc(uid).collection('catalog').doc(itemId).delete();
            console.log(`CloudSync: Item ${itemId} deleted from cloud.`);
        } catch (err) {
            console.log('CloudSync delete catalog info:', err.message);
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

        // Pull cloud history
        const cloudDocs = await this.fetchHistory();
        if (cloudDocs && cloudDocs.length > 0) {
            localStorage.setItem(StorageManager.KEYS.HISTORY, JSON.stringify(cloudDocs));
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

        // Re-render UI views with pulled Cloud Data
        if (typeof App !== 'undefined' && App.renderAllViews) {
            App.renderAllViews();
        }
    }
};
