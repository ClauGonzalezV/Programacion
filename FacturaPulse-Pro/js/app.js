/* ==========================================================================
   MAIN APP CONTROLLER - TAB ROUTING, MODALS & EVENT HANDLERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const App = {
    init() {
        EditorModule.init();
        this.bindTabNavigation();
        this.bindGlobalActions();
        this.bindModals();
        this.renderAllViews();
        this.initTheme();
    },

    initTheme() {
        const btn = document.getElementById('btn-theme-toggle');
        const icon = document.getElementById('theme-icon');

        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);

            if (newTheme === 'dark') {
                icon.className = 'fa-solid fa-moon';
            } else {
                icon.className = 'fa-solid fa-sun';
            }
        });
    },

    bindTabNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${targetTab}`).classList.add('active');

                if (targetTab === 'clients') this.renderClientsTab();
                if (targetTab === 'catalog') this.renderCatalogTab();
                if (targetTab === 'history') this.renderHistoryTab();
            });
        });
    },

    bindGlobalActions() {
        // PDF Export
        document.getElementById('btn-export-pdf').addEventListener('click', () => {
            const data = EditorModule.getCollectFormData();
            StorageManager.saveDocumentToHistory(data);
            this.updateHistoryBadge();
            ExportModule.exportToPDF(data);
        });

        // Save Draft
        document.getElementById('btn-save-draft').addEventListener('click', () => {
            const data = EditorModule.getCollectFormData();
            StorageManager.saveDocumentToHistory(data);
            this.updateHistoryBadge();
            showToast('Documento guardado en el historial', 'success');
        });

        // Print Direct
        document.getElementById('btn-print-direct').addEventListener('click', () => {
            ExportModule.printDocument();
        });

        // Load Saved Client from Editor button
        document.getElementById('btn-load-saved-client').addEventListener('click', () => {
            const clients = StorageManager.getClients();
            if (clients.length === 0) {
                showToast('No tienes clientes guardados aún', 'info');
                return;
            }
            this.openClientPickerModal();
        });

        // Quick Save Client from Editor button
        document.getElementById('btn-quick-save-client').addEventListener('click', () => {
            const name = document.getElementById('input-client-name').value;
            if (!name) {
                showToast('Escribe el nombre del cliente primero', 'error');
                return;
            }
            const client = {
                name: name,
                taxId: document.getElementById('input-client-taxid').value,
                email: document.getElementById('input-client-email').value,
                phone: document.getElementById('input-client-phone').value,
                address: document.getElementById('input-client-address').value
            };
            StorageManager.addClient(client);
            showToast(`Cliente '${name}' guardado correctamente`, 'success');
        });

        // Backup Export
        document.getElementById('btn-export-backup').addEventListener('click', () => {
            StorageManager.exportBackupJSON();
            showToast('Respaldo descargado', 'success');
        });

        // Backup Import
        const btnImportTrigger = document.getElementById('btn-import-backup-trigger');
        const inputImport = document.getElementById('input-import-backup');
        if (btnImportTrigger && inputImport) {
            btnImportTrigger.addEventListener('click', () => inputImport.click());
            inputImport.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const result = StorageManager.importBackupJSON(evt.target.result);
                        if (result.success) {
                            this.renderAllViews();
                            showToast('Respaldo restaurado con éxito', 'success');
                        } else {
                            showToast('Error al procesar el archivo JSON de respaldo', 'error');
                        }
                        inputImport.value = '';
                    };
                    reader.readAsText(file);
                }
            });
        }

        // Clear History
        document.getElementById('btn-clear-history').addEventListener('click', () => {
            if (confirm('¿Estás seguro de vaciar el historial de facturas?')) {
                StorageManager.clearHistory();
                this.renderHistoryTab();
                showToast('Historial vaciado', 'info');
            }
        });
    },

    loadClientIntoEditor(client) {
        document.getElementById('input-client-name').value = client.name || '';
        document.getElementById('input-client-taxid').value = client.taxId || '';
        document.getElementById('input-client-email').value = client.email || '';
        document.getElementById('input-client-phone').value = client.phone || '';
        document.getElementById('input-client-address').value = client.address || '';
        EditorModule.recalculateAndRender();
        showToast(`Cliente '${client.name}' cargado en el editor`, 'success');
    },

    bindModals() {
        // Close modal buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.close;
                document.getElementById(modalId).classList.add('hidden');
            });
        });

        // Client Picker Modal: live search filter
        const searchInput = document.getElementById('modal-load-client-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const q = searchInput.value.toLowerCase();
                document.querySelectorAll('.client-picker-item').forEach(el => {
                    const text = el.textContent.toLowerCase();
                    el.style.display = text.includes(q) ? '' : 'none';
                });
            });
        }

        // Open Client Modal
        document.getElementById('btn-new-client-modal').addEventListener('click', () => {
            document.getElementById('form-modal-client').reset();
            document.getElementById('modal-client-id').value = '';
            document.getElementById('modal-client-title').innerHTML = '<i class="fa-solid fa-user-plus"></i> Nuevo Cliente';
            document.getElementById('modal-client').classList.remove('hidden');
        });

        // Save Client Modal Form Submit
        document.getElementById('form-modal-client').addEventListener('submit', (e) => {
            e.preventDefault();
            const client = {
                name: document.getElementById('modal-client-name').value,
                taxId: document.getElementById('modal-client-taxid').value,
                email: document.getElementById('modal-client-email').value,
                phone: document.getElementById('modal-client-phone').value,
                address: document.getElementById('modal-client-address').value
            };
            StorageManager.addClient(client);
            document.getElementById('modal-client').classList.add('hidden');
            this.renderClientsTab();
            showToast('Cliente guardado con éxito', 'success');
        });

        // Open Catalog Item Modal
        document.getElementById('btn-new-catalog-item-modal').addEventListener('click', () => {
            document.getElementById('form-modal-catalog').reset();
            document.getElementById('modal-catalog').classList.remove('hidden');
        });

        // Save Catalog Form Submit
        document.getElementById('form-modal-catalog').addEventListener('submit', (e) => {
            e.preventDefault();
            const item = {
                name: document.getElementById('modal-catalog-name').value,
                price: parseFloat(document.getElementById('modal-catalog-price').value) || 0
            };
            StorageManager.addCatalogItem(item);
            document.getElementById('modal-catalog').classList.add('hidden');
            this.renderCatalogTab();
            showToast('Servicio añadido al catálogo', 'success');
        });

        // Open Select Catalog Modal (from Editor)
        document.getElementById('btn-open-catalog-modal').addEventListener('click', () => {
            const catalog = StorageManager.getCatalog();
            const listEl = document.getElementById('modal-catalog-select-list');
            if (catalog.length === 0) {
                listEl.innerHTML = '<p style="color: #94a3b8;">No hay servicios en el catálogo. Añade algunos en la pestaña "Servicios".</p>';
            } else {
                listEl.innerHTML = catalog.map(item => `
                    <div class="catalog-select-item">
                        <label>
                            <input type="checkbox" class="chk-catalog-select" value="${item.id}" data-name="${item.name}" data-price="${item.price}">
                            <span>${item.name}</span>
                        </label>
                        <strong style="color: var(--accent-color);">$ ${item.price.toFixed(2)}</strong>
                    </div>
                `).join('');
            }
            document.getElementById('modal-select-catalog').classList.remove('hidden');
        });

        // Insert Selected Catalog Items to Editor
        document.getElementById('btn-insert-selected-catalog').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.chk-catalog-select:checked');
            if (checkboxes.length === 0) {
                showToast('Selecciona al menos un servicio', 'info');
                return;
            }
            checkboxes.forEach(chk => {
                EditorModule.addItemRow(chk.dataset.name, 1, parseFloat(chk.dataset.price));
            });
            EditorModule.recalculateAndRender();
            document.getElementById('modal-select-catalog').classList.add('hidden');
            showToast(`${checkboxes.length} ítem(s) insertados en la cotización`, 'success');
        });
    },

    openClientPickerModal() {
        const clients = StorageManager.getClients();
        const listEl = document.getElementById('modal-load-client-list');
        const searchInput = document.getElementById('modal-load-client-search');
        if (searchInput) searchInput.value = '';

        if (clients.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No hay clientes guardados.</p>';
        } else {
            listEl.innerHTML = clients.map(c => `
                <div class="client-picker-item" data-id="${c.id}">
                    <div class="client-picker-info">
                        <div class="client-picker-name">${c.name}</div>
                        ${c.taxId ? `<div class="client-picker-detail">${c.taxId}</div>` : ''}
                        ${c.email ? `<div class="client-picker-detail">${c.email}</div>` : ''}
                    </div>
                    <button type="button" class="btn btn-xs btn-primary btn-load-this-client" data-id="${c.id}">
                        <i class="fa-solid fa-check"></i> Cargar
                    </button>
                </div>
            `).join('');

            listEl.querySelectorAll('.btn-load-this-client').forEach(btn => {
                btn.addEventListener('click', () => {
                    const client = clients.find(c => c.id === btn.dataset.id);
                    if (client) {
                        this.loadClientIntoEditor(client);
                        document.getElementById('modal-load-client').classList.add('hidden');
                    }
                });
            });
        }

        document.getElementById('modal-load-client').classList.remove('hidden');
    },

    renderAllViews() {
        this.renderClientsTab();
        this.renderCatalogTab();
        this.renderHistoryTab();
        this.updateHistoryBadge();
    },

    updateHistoryBadge() {
        const history = StorageManager.getHistory();
        document.getElementById('history-count').textContent = history.length;
    },

    renderClientsTab() {
        const grid = document.getElementById('clients-cards-list');
        const clients = StorageManager.getClients();

        if (clients.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No hay clientes guardados aún.</div>';
            return;
        }

        grid.innerHTML = clients.map(c => `
            <div class="client-card">
                <div>
                    <div class="client-card-header">
                        <div class="client-name">${c.name}</div>
                        ${c.taxId ? `<div class="client-taxid">${c.taxId}</div>` : ''}
                    </div>
                    <div class="client-details">
                        ${c.email ? `<div><i class="fa-regular fa-envelope"></i> ${c.email}</div>` : ''}
                        ${c.phone ? `<div><i class="fa-solid fa-phone"></i> ${c.phone}</div>` : ''}
                        ${c.address ? `<div><i class="fa-solid fa-location-dot"></i> ${c.address}</div>` : ''}
                    </div>
                </div>
                <div class="client-actions">
                    <button type="button" class="btn btn-xs btn-primary" onclick="App.loadClientAndSwitch('${c.id}')">
                        <i class="fa-solid fa-file-circle-plus"></i> Usar en Cotización
                    </button>
                    <button type="button" class="btn btn-xs btn-ghost" onclick="App.deleteClientItem('${c.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    loadClientAndSwitch(id) {
        const clients = StorageManager.getClients();
        const client = clients.find(c => c.id === id);
        if (client) {
            this.loadClientIntoEditor(client);
            document.getElementById('tab-btn-editor').click();
        }
    },

    deleteClientItem(id) {
        if (confirm('¿Eliminar este cliente?')) {
            StorageManager.deleteClient(id);
            this.renderClientsTab();
            showToast('Cliente eliminado', 'info');
        }
    },

    renderCatalogTab() {
        const tbody = document.getElementById('catalog-table-body');
        const catalog = StorageManager.getCatalog();

        if (catalog.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color: var(--text-muted); padding: 24px;">El catálogo está vacío.</td></tr>';
            return;
        }

        tbody.innerHTML = catalog.map(item => `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>$ ${item.price.toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-xs btn-outline" onclick="App.addCatalogToCurrentDoc('${item.id}')">
                        <i class="fa-solid fa-plus"></i> Añadir a Doc
                    </button>
                    <button type="button" class="btn btn-xs btn-ghost" onclick="App.deleteCatalogItem('${item.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    addCatalogToCurrentDoc(id) {
        const catalog = StorageManager.getCatalog();
        const item = catalog.find(i => i.id === id);
        if (item) {
            EditorModule.addItemRow(item.name, 1, item.price);
            EditorModule.recalculateAndRender();
            showToast(`'${item.name}' añadido al documento`, 'success');
        }
    },

    deleteCatalogItem(id) {
        if (confirm('¿Eliminar este servicio del catálogo?')) {
            StorageManager.deleteCatalogItem(id);
            this.renderCatalogTab();
            showToast('Servicio eliminado', 'info');
        }
    },

    renderHistoryTab() {
        const tbody = document.getElementById('history-table-body');
        const history = StorageManager.getHistory();

        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="color: var(--text-muted); padding: 40px;">No tienes facturas ni cotizaciones guardadas aún.</td></tr>';
            return;
        }

        tbody.innerHTML = history.map(h => `
            <tr>
                <td><strong>${h.number}</strong></td>
                <td>${h.docType}</td>
                <td>${h.client.name || 'Sin cliente'}</td>
                <td>${h.date || 'N/A'}</td>
                <td><strong>${h.currencySymbol} ${h.totals.grandTotal.toLocaleString('es-CL', { minimumFractionDigits: 2 })}</strong></td>
                <td><span class="status-pill ${h.status}">${h.status}</span></td>
                <td>
                    <button type="button" class="btn btn-xs btn-secondary" onclick="App.reloadDocumentFromHistory('${h.number}')" title="Cargar en editor">
                        <i class="fa-solid fa-pen-to-square"></i> Cargar
                    </button>
                    <button type="button" class="btn btn-xs btn-primary" onclick="App.exportHistoryPDF('${h.number}')" title="Exportar a PDF">
                        <i class="fa-solid fa-file-pdf"></i> PDF
                    </button>
                    <button type="button" class="btn btn-xs btn-ghost" onclick="App.deleteHistoryItem('${h.number}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    reloadDocumentFromHistory(number) {
        const history = StorageManager.getHistory();
        const doc = history.find(h => h.number === number);
        if (doc) {
            document.getElementById('doc-type').value = doc.docType || 'COTIZACIÓN';
            document.getElementById('doc-currency').value = doc.currency || 'USD';
            document.getElementById('doc-template').value = doc.template || 'modern';
            document.getElementById('input-doc-number').value = doc.number || '';
            document.getElementById('input-doc-status').value = doc.status || 'Pendiente';
            document.getElementById('input-doc-date').value = doc.date || '';
            document.getElementById('input-doc-duedate').value = doc.dueDate || '';

            if (doc.emitter) {
                document.getElementById('input-emitter-name').value = doc.emitter.name || '';
                document.getElementById('input-emitter-taxid').value = doc.emitter.taxId || '';
                document.getElementById('input-emitter-email').value = doc.emitter.email || '';
                document.getElementById('input-emitter-phone').value = doc.emitter.phone || '';
                document.getElementById('input-emitter-address').value = doc.emitter.address || '';
            }

            if (doc.client) {
                document.getElementById('input-client-name').value = doc.client.name || '';
                document.getElementById('input-client-taxid').value = doc.client.taxId || '';
                document.getElementById('input-client-email').value = doc.client.email || '';
                document.getElementById('input-client-phone').value = doc.client.phone || '';
                document.getElementById('input-client-address').value = doc.client.address || '';
            }

            const tbody = document.getElementById('items-tbody');
            tbody.innerHTML = '';
            if (doc.items && doc.items.length > 0) {
                doc.items.forEach(it => EditorModule.addItemRow(it.description, it.quantity, it.price));
            }

            document.getElementById('input-tax-rate').value = doc.taxRate || 0;
            document.getElementById('input-discount-val').value = doc.discountVal || 0;
            document.getElementById('input-discount-type').value = doc.discountType || 'percent';
            document.getElementById('input-shipping-fee').value = (doc.totals && doc.totals.shippingFee) ? doc.totals.shippingFee : 0;
            document.getElementById('input-bank-details').value = doc.bankDetails || '';
            document.getElementById('input-terms-conditions').value = doc.terms || '';
            document.getElementById('input-custom-notes').value = doc.customNotes || '';
            if (document.getElementById('input-qr-url')) document.getElementById('input-qr-url').value = doc.qrUrl || '';
            if (document.getElementById('input-signer-name')) document.getElementById('input-signer-name').value = doc.signerName || '';

            EditorModule.recalculateAndRender();
            document.getElementById('tab-btn-editor').click();
            showToast(`Documento N° ${number} cargado en el editor`, 'success');
        }
    },

    exportHistoryPDF(number) {
        const history = StorageManager.getHistory();
        const doc = history.find(h => h.number === number);
        if (doc) {
            this.reloadDocumentFromHistory(number);
            setTimeout(() => {
                ExportModule.exportToPDF(doc);
            }, 300);
        }
    },

    deleteHistoryItem(number) {
        if (confirm(`¿Eliminar el documento N° ${number} del historial?`)) {
            StorageManager.deleteHistoryDocument(number);
            this.renderHistoryTab();
            this.updateHistoryBadge();
            showToast('Documento eliminado del historial', 'info');
        }
    }
};
