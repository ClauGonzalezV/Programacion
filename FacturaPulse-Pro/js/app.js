/* ==========================================================================
   MAIN APP CONTROLLER - TAB ROUTING, MODALS & EVENT HANDLERS
   ========================================================================== */



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
        try { EditorModule.init(); } catch (e) { console.error('EditorModule init error:', e); }
        try { this.bindTabNavigation(); } catch (e) { console.error('bindTabNavigation error:', e); }
        try { this.bindGlobalActions(); } catch (e) { console.error('bindGlobalActions error:', e); }
        try { this.bindModals(); } catch (e) { console.error('bindModals error:', e); }
        try { this.renderAllViews(); } catch (e) { console.error('renderAllViews error:', e); }
        try { this.initTheme(); } catch (e) { console.error('initTheme error:', e); }
        try { this.initResizer(); } catch (e) { console.error('initResizer error:', e); }
        try { this.initAutoDocumentScaler(); } catch (e) { console.error('initAutoDocumentScaler error:', e); }
    },

    initAutoDocumentScaler() {
        const fitScaler = () => {
            const wrapper = document.querySelector('.paper-container-wrapper');
            const paper = document.getElementById('document-paper');
            if (!wrapper || !paper) return;

            const padding = 20;
            const availableWidth = wrapper.clientWidth - padding;
            const paperWidth = 794; // Ancho A4 en píxeles (210mm)

            if (availableWidth > 0 && availableWidth < paperWidth) {
                const scale = availableWidth / paperWidth;
                paper.style.transform = `scale(${scale})`;
                paper.style.transformOrigin = 'top center';
                paper.style.marginBottom = `-${(paper.offsetHeight || 1123) * (1 - scale)}px`;
            } else {
                paper.style.transform = 'none';
                paper.style.transformOrigin = 'top center';
                paper.style.marginBottom = '0px';
            }
        };

        window.addEventListener('resize', fitScaler);
        window.addEventListener('orientationchange', fitScaler);
        document.addEventListener('DOMContentLoaded', fitScaler);
        setTimeout(fitScaler, 200);
        setTimeout(fitScaler, 800);

        window.fitDocumentPaperToContainer = fitScaler;
    },

    initResizer() {
        const handle = document.getElementById('resizer-handle');
        const grid = document.getElementById('workspace-grid');
        if (!handle || !grid) return;

        let savedWidth = parseInt(localStorage.getItem('emitia_editor_width'), 10);
        if (isNaN(savedWidth) || savedWidth < 380 || savedWidth > 750) {
            savedWidth = 480;
        }
        grid.style.setProperty('--editor-width', `${savedWidth}px`);

        let isDragging = false;

        handle.addEventListener('mousedown', () => {
            isDragging = true;
            handle.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const gridRect = grid.getBoundingClientRect();
            let newWidth = e.clientX - gridRect.left;
            if (isNaN(newWidth) || newWidth < 380) newWidth = 380;
            if (newWidth > 750) newWidth = 750;
            grid.style.setProperty('--editor-width', `${newWidth}px`);
            localStorage.setItem('emitia_editor_width', newWidth);
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
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

                if (targetTab !== 'editor' && typeof AuthSubscription !== 'undefined' && !AuthSubscription.userPlan.isPro) {
                    const names = {
                        dashboard: 'El Dashboard de Estadísticas',
                        clients: 'La Gestión de Clientes',
                        catalog: 'El Catálogo de Servicios',
                        history: 'El Historial de Documentos'
                    };
                    const title = names[targetTab] || 'Esta sección';
                    showToast(`🔒 ${title} es exclusiva del PLAN PRO. El Plan Gratuito solo incluye el Creador.`, 'error');
                    AuthSubscription.showPricingModal();
                    return;
                }

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${targetTab}`).classList.add('active');

                if (targetTab === 'dashboard') DashboardModule.render();
                if (targetTab === 'clients') this.renderClientsTab();
                if (targetTab === 'catalog') this.renderCatalogTab();
                if (targetTab === 'history') this.renderHistoryTab();
            });
        });
    },

    bindGlobalActions() {
        // Sample Data Button
        const btnSample = document.getElementById('btn-sample-data');
        if (btnSample) {
            btnSample.addEventListener('click', () => {
                EditorModule.loadSampleData();
            });
        }

        // PDF Export & Print Button in Preview Bar
        const btnPrintDirect = document.getElementById('btn-print-direct');
        if (btnPrintDirect) {
            btnPrintDirect.addEventListener('click', () => {
                if (typeof AuthSubscription !== 'undefined' && !AuthSubscription.userPlan.isPro) {
                    showToast('🔒 La descarga a PDF e impresión es exclusiva del PLAN PRO. ¡Suscríbete para descargar tus documentos!', 'error');
                    AuthSubscription.showPricingModal();
                    return;
                }
                const data = EditorModule.getCollectFormData();
                StorageManager.saveDocumentToHistory(data);
                EditorModule.incrementDocCounter(data.docType);
                this.updateHistoryBadge();
                ExportModule.exportToPDF(data);
            });
        }

        // Save Draft Button
        const btnSaveDraft = document.getElementById('btn-save-draft');
        if (btnSaveDraft) {
            btnSaveDraft.addEventListener('click', () => {
                const data = EditorModule.getCollectFormData();
                if (typeof AuthSubscription !== 'undefined' && !AuthSubscription.userPlan.isPro) {
                    const history = StorageManager.getHistory();
                    const isExisting = history.some(h => h.number === data.number);
                    if (!isExisting && history.length >= 3) {
                        showToast('🔒 Límite de 3 documentos del Plan Gratuito alcanzado. ¡Actualiza a PLAN PRO para guardar ilimitados!', 'error');
                        AuthSubscription.showPricingModal();
                        return;
                    }
                }
                StorageManager.saveDocumentToHistory(data);
                EditorModule.incrementDocCounter(data.docType);
                this.updateHistoryBadge();
                showToast('Documento guardado en el historial', 'success');
            });
        }

        // Accounting Report Export Button
        const btnAccountingReport = document.getElementById('btn-export-accounting-report');
        if (btnAccountingReport) {
            btnAccountingReport.addEventListener('click', () => {
                ExportModule.exportAccountingReportPDF();
            });
        }

        // Email Button
        const btnEmail = document.getElementById('btn-send-email');
        if (btnEmail) {
            btnEmail.addEventListener('click', () => {
                if (typeof AuthSubscription !== 'undefined' && !AuthSubscription.userPlan.isPro) {
                    showToast('🔒 El envío de documentos por Email es exclusivo del PLAN PRO. ¡Suscríbete para desbloquearlo!', 'error');
                    AuthSubscription.showPricingModal();
                    return;
                }
                this.sendByEmail();
            });
        }

        // Zoom/Fit View Button
        const btnZoom = document.getElementById('btn-zoom-fit');
        if (btnZoom) {
            btnZoom.addEventListener('click', () => {
                const wrapper = document.querySelector('.paper-container-wrapper');
                if (wrapper) {
                    wrapper.classList.toggle('full-width');
                    showToast(wrapper.classList.contains('full-width') ? 'Vista ampliada' : 'Vista estándar', 'info');
                }
            });
        }

        // Load Saved Client from Editor button
        const btnLoadClient = document.getElementById('btn-load-saved-client');
        if (btnLoadClient) {
            btnLoadClient.addEventListener('click', () => {
                const clients = StorageManager.getClients();
                if (clients.length === 0) {
                    showToast('No tienes clientes guardados aún', 'info');
                    return;
                }
                this.openClientPickerModal();
            });
        }

        // Quick Save Client from Editor button
        const btnSaveClient = document.getElementById('btn-quick-save-client');
        if (btnSaveClient) {
            btnSaveClient.addEventListener('click', () => {
                const nameInput = document.getElementById('input-client-name');
                const name = nameInput ? nameInput.value : '';
                if (!name) {
                    showToast('Escribe el nombre del cliente primero', 'error');
                    return;
                }
                const client = {
                    name: name,
                    taxId: document.getElementById('input-client-taxid') ? document.getElementById('input-client-taxid').value : '',
                    email: document.getElementById('input-client-email') ? document.getElementById('input-client-email').value : '',
                    phone: document.getElementById('input-client-phone') ? document.getElementById('input-client-phone').value : '',
                    address: document.getElementById('input-client-address') ? document.getElementById('input-client-address').value : ''
                };
                StorageManager.addClient(client);
                showToast(`Cliente '${name}' guardado correctamente`, 'success');
            });
        }

        // Backup Export
        const btnExportBackup = document.getElementById('btn-export-backup');
        if (btnExportBackup) {
            btnExportBackup.addEventListener('click', () => {
                StorageManager.exportBackupJSON();
                showToast('Respaldo descargado', 'success');
            });
        }

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
        const btnClearHistory = document.getElementById('btn-clear-history');
        if (btnClearHistory) {
            btnClearHistory.addEventListener('click', () => {
                if (confirm('¿Estás seguro de vaciar el historial de facturas?')) {
                    StorageManager.clearHistory();
                    this.renderHistoryTab();
                    showToast('Historial vaciado', 'info');
                }
            });
        }

        // Intercept Ctrl+P to prevent browser print on Free Plan
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                if (typeof AuthSubscription !== 'undefined' && !AuthSubscription.userPlan.isPro) {
                    e.preventDefault();
                    e.stopPropagation();
                    showToast('🔒 La descarga a PDF e impresión es exclusiva del PLAN PRO.', 'error');
                    AuthSubscription.showPricingModal();
                }
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
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.add('hidden');
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
        const btnNewClientModal = document.getElementById('btn-new-client-modal');
        if (btnNewClientModal) {
            btnNewClientModal.addEventListener('click', () => {
                const form = document.getElementById('form-modal-client');
                if (form) form.reset();
                const idInput = document.getElementById('modal-client-id');
                if (idInput) idInput.value = '';
                const title = document.getElementById('modal-client-title');
                if (title) title.innerHTML = '<i class="fa-solid fa-user-plus"></i> Nuevo Cliente';
                const modal = document.getElementById('modal-client');
                if (modal) modal.classList.remove('hidden');
            });
        }

        // Save Client Modal Form Submit
        const formClient = document.getElementById('form-modal-client');
        if (formClient) {
            formClient.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('modal-client-name') ? document.getElementById('modal-client-name').value.trim() : '';
                const taxId = document.getElementById('modal-client-taxid') ? document.getElementById('modal-client-taxid').value.trim() : '';
                const email = document.getElementById('modal-client-email') ? document.getElementById('modal-client-email').value.trim() : '';
                const phone = document.getElementById('modal-client-phone') ? document.getElementById('modal-client-phone').value.trim() : '';
                const address = document.getElementById('modal-client-address') ? document.getElementById('modal-client-address').value.trim() : '';

                if (!name) {
                    showToast('⚠️ Ingresa la Razón Social o Nombre del Cliente.', 'error');
                    return;
                }

                if (taxId && typeof EditorModule !== 'undefined' && !EditorModule.isValidRut(taxId)) {
                    showToast('⚠️ La Identificación Fiscal (RUT) del cliente no es válida (ej: 12.345.678-K).', 'error');
                    return;
                }

                if (email && typeof EditorModule !== 'undefined' && !EditorModule.isValidEmail(email)) {
                    showToast('⚠️ El Correo Electrónico del cliente no es válido (ej: contacto@cliente.com).', 'error');
                    return;
                }

                if (phone && typeof EditorModule !== 'undefined' && !EditorModule.isValidPhone(phone)) {
                    showToast('⚠️ El Teléfono del cliente no es válido (ej: +56 9 1234 5678).', 'error');
                    return;
                }

                const client = {
                    name,
                    taxId: (taxId && typeof EditorModule !== 'undefined') ? EditorModule.formatRut(taxId) : taxId,
                    email,
                    phone,
                    address
                };
                StorageManager.addClient(client);
                const modal = document.getElementById('modal-client');
                if (modal) modal.classList.add('hidden');
                this.renderClientsTab();
                showToast('Cliente guardado con éxito', 'success');
            });
        }

        // Open Catalog Item Modal
        const btnNewCatalogModal = document.getElementById('btn-new-catalog-item-modal');
        if (btnNewCatalogModal) {
            btnNewCatalogModal.addEventListener('click', () => {
                const form = document.getElementById('form-modal-catalog');
                if (form) form.reset();
                const modal = document.getElementById('modal-catalog');
                if (modal) modal.classList.remove('hidden');
            });
        }

        // Catalog Product Image Uploader Listener
        const catalogImgInput = document.getElementById('modal-catalog-img-input');
        const catalogImgPreview = document.getElementById('modal-catalog-img-preview');
        const catalogImgHidden = document.getElementById('modal-catalog-image');
        const catalogImgRemove = document.getElementById('modal-catalog-img-remove');

        if (catalogImgInput) {
            catalogImgInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const base64 = evt.target.result;
                        if (catalogImgHidden) catalogImgHidden.value = base64;
                        if (catalogImgPreview) {
                            catalogImgPreview.innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:cover;">`;
                        }
                        if (catalogImgRemove) catalogImgRemove.style.display = 'inline-flex';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (catalogImgRemove) {
            catalogImgRemove.addEventListener('click', () => {
                if (catalogImgInput) catalogImgInput.value = '';
                if (catalogImgHidden) catalogImgHidden.value = '';
                if (catalogImgPreview) {
                    catalogImgPreview.innerHTML = `<i class="fa-solid fa-camera" style="font-size: 1.2rem; color: var(--text-muted);"></i>`;
                }
                catalogImgRemove.style.display = 'none';
            });
        }

        // Save Catalog Form Submit
        const formCatalog = document.getElementById('form-modal-catalog');
        if (formCatalog) {
            formCatalog.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameEl = document.getElementById('modal-catalog-name');
                const priceEl = document.getElementById('modal-catalog-price');
                const imageEl = document.getElementById('modal-catalog-image');
                const item = {
                    name: nameEl ? nameEl.value : '',
                    price: priceEl ? (parseFloat(priceEl.value) || 0) : 0,
                    image: imageEl ? imageEl.value : ''
                };
                StorageManager.addCatalogItem(item);
                const modal = document.getElementById('modal-catalog');
                if (modal) modal.classList.add('hidden');
                
                // Reset catalog modal inputs
                formCatalog.reset();
                if (catalogImgHidden) catalogImgHidden.value = '';
                if (catalogImgPreview) {
                    catalogImgPreview.innerHTML = `<i class="fa-solid fa-camera" style="font-size: 1.2rem; color: var(--text-muted);"></i>`;
                }
                if (catalogImgRemove) catalogImgRemove.style.display = 'none';

                this.renderCatalogTab();
                showToast('Servicio con imagen añadido al catálogo', 'success');
            });
        }

        // Open Select Catalog Modal (from Editor)
        const btnOpenCatalogModal = document.getElementById('btn-open-catalog-modal');
        if (btnOpenCatalogModal) {
            btnOpenCatalogModal.addEventListener('click', () => {
                const catalog = StorageManager.getCatalog();
                const listEl = document.getElementById('modal-catalog-select-list');
                if (listEl) {
                    if (catalog.length === 0) {
                        listEl.innerHTML = '<p style="color: #94a3b8;">No hay servicios en el catálogo. Añade algunos en la pestaña "Servicios".</p>';
                    } else {
                        listEl.innerHTML = catalog.map(item => `
                            <div class="catalog-select-item" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--border-color);">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
                                    <input type="checkbox" class="chk-catalog-select" value="${item.id}" data-name="${item.name.replace(/"/g, '&quot;')}" data-price="${item.price}" data-image="${item.image || ''}">
                                    <div style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--border-color); overflow: hidden; background: var(--bg-card); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-camera" style="font-size: 0.75rem; color: var(--text-muted);"></i>`}
                                    </div>
                                    <span>${item.name}</span>
                                </label>
                                <strong style="color: var(--accent-color); font-family: monospace;">$ ${item.price.toFixed(2)}</strong>
                            </div>
                        `).join('');
                    }
                }
                const modal = document.getElementById('modal-select-catalog');
                if (modal) modal.classList.remove('hidden');
            });
        }

        // Insert Selected Catalog Items to Editor
        const btnInsertCatalog = document.getElementById('btn-insert-selected-catalog');
        if (btnInsertCatalog) {
            btnInsertCatalog.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('.chk-catalog-select:checked');
                if (checkboxes.length === 0) {
                    showToast('Selecciona al menos un servicio', 'info');
                    return;
                }
                checkboxes.forEach(chk => {
                    EditorModule.addItemRow(chk.dataset.name, 1, parseFloat(chk.dataset.price), chk.dataset.image || '');
                });
                EditorModule.recalculateAndRender();
                const modal = document.getElementById('modal-select-catalog');
                if (modal) modal.classList.add('hidden');
                showToast(`${checkboxes.length} ítem(s) insertados en la cotización`, 'success');
            });
        }
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
        const badge = document.getElementById('history-count');
        if (badge) badge.textContent = history.length;
    },

    renderClientsTab() {
        const grid = document.getElementById('clients-cards-list');
        if (!grid) return;
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
        if (!tbody) return;
        const catalog = StorageManager.getCatalog();

        if (catalog.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: var(--text-muted); padding: 24px;">El catálogo está vacío.</td></tr>';
            return;
        }

        tbody.innerHTML = catalog.map(item => `
            <tr>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="width: 42px; height: 42px; border-radius: 6px; border: 1px solid var(--border-color); overflow: hidden; background: var(--bg-card); display: inline-flex; align-items: center; justify-content: center;">
                        ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-camera" style="font-size: 0.9rem; color: var(--text-muted);"></i>`}
                    </div>
                </td>
                <td style="vertical-align: middle;"><strong>${item.name}</strong></td>
                <td style="vertical-align: middle; font-family: monospace; font-weight: 600;">$ ${item.price.toFixed(2)}</td>
                <td style="vertical-align: middle;">
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
            EditorModule.addItemRow(item.name, 1, item.price, item.image || '');
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
        if (!tbody) return;
        const history = StorageManager.getHistory();

        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="color: var(--text-muted); padding: 40px;">No tienes facturas ni cotizaciones guardadas aún.</td></tr>';
            return;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        tbody.innerHTML = history.map(h => {
            // Feature 13: Due date alert badges
            let dueBadge = '';
            if (h.dueDate && h.status !== 'Pagada') {
                const dd = new Date(h.dueDate);
                const diff = Math.ceil((dd - now) / (1000 * 60 * 60 * 24));
                if (diff < 0) dueBadge = '<span class="due-badge badge-due-overdue">VENCIDA</span>';
                else if (diff <= 3) dueBadge = `<span class="due-badge badge-due-warn">${diff === 0 ? 'HOY' : diff + 'd'}</span>`;
                else dueBadge = `<span class="due-badge badge-due-ok">${diff}d</span>`;
            }

            const fmtDate = h.dueDate ? h.dueDate.split('-').reverse().join('/') : 'N/A';

            const isClp = !h.currency || h.currency === 'CLP' || h.currency.includes('CLP') || h.currencySymbol === '$';
            const dec = isClp ? 0 : 2;
            const fmtTotal = h.totals.grandTotal.toLocaleString('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec });

            const isPro = typeof AuthSubscription !== 'undefined' && AuthSubscription.userPlan && AuthSubscription.userPlan.isPro;
            const pdfIcon = isPro ? 'fa-file-pdf' : 'fa-lock';
            const pdfClass = isPro ? 'btn-primary' : 'btn-outline';
            const pdfTitle = isPro ? 'Exportar PDF' : 'PDF 🔒 (Plan PRO)';

            return `
            <tr>
                <td style="white-space: nowrap;"><strong style="font-family: monospace;">${h.number}</strong></td>
                <td style="white-space: nowrap;">${h.docType}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${h.client.name || 'Sin cliente'}">${h.client.name || 'Sin cliente'}</td>
                <td style="white-space: nowrap;">${h.date || 'N/A'}</td>
                <td style="white-space: nowrap;">${fmtDate} ${dueBadge}</td>
                <td style="white-space: nowrap;"><strong>${h.currencySymbol} ${fmtTotal}</strong></td>
                <td style="white-space: nowrap;"><span class="status-pill ${h.status}">${h.status}</span></td>
                <td style="white-space: nowrap; text-align: center; min-width: 190px;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                        <button type="button" class="btn btn-xs btn-secondary" onclick="App.reloadDocumentFromHistory('${h.number}')" title="Cargar en editor">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn btn-xs btn-outline" onclick="App.sendPaymentReminder('${h.number}')" title="Enviar Recordatorio de Cobranza">
                            <i class="fa-solid fa-bell" style="color: #f59e0b;"></i>
                        </button>
                        <button type="button" class="btn btn-xs btn-outline" onclick="App.duplicateDocument('${h.number}')" title="Duplicar">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                        <button type="button" class="btn btn-xs ${pdfClass}" onclick="App.exportHistoryPDF('${h.number}')" title="${pdfTitle}">
                            <i class="fa-solid ${pdfIcon}"></i>
                        </button>
                        <button type="button" class="btn btn-xs btn-ghost text-danger" onclick="App.deleteHistoryItem('${h.number}')" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    },

    reloadDocumentFromHistory(number) {
        const history = StorageManager.getHistory();
        const doc = history.find(h => h.number === number);
        if (doc) {
            document.getElementById('doc-type').value = doc.docType || 'COTIZACIÓN';
            document.getElementById('doc-currency').value = doc.currency || 'CLP';
            const currOpt = document.getElementById('doc-currency').options[document.getElementById('doc-currency').selectedIndex];
            EditorModule.state.currencySymbol = currOpt ? currOpt.dataset.symbol : '$';
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
    },

    // Feature 6: Duplicate Document
    duplicateDocument(number) {
        const history = StorageManager.getHistory();
        const doc = history.find(h => h.number === number);
        if (doc) {
            this.reloadDocumentFromHistory(number);
            setTimeout(() => {
                EditorModule.autoSetDocNumber();
                EditorModule.setDefaultDates();
                document.getElementById('input-doc-status').value = 'Borrador';
                EditorModule.recalculateAndRender();
                showToast(`Documento duplicado. Nuevo número asignado.`, 'success');
            }, 100);
        }
    },





    // Feature 3: Send by Email (PRO Feature)
    sendByEmail() {
        if (typeof AuthSubscription !== 'undefined' && (!AuthSubscription.userPlan || !AuthSubscription.userPlan.isPro)) {
            if (typeof showToast === 'function') {
                showToast('🔒 El envío de documentos por Email es exclusivo del PLAN PRO. ¡Suscríbete para desbloquearlo!', 'error');
            }
            if (typeof AuthSubscription.showPricingModal === 'function') {
                AuthSubscription.showPricingModal();
            }
            return;
        }

        const data = EditorModule.getCollectFormData();
        let targetEmail = (data.client && data.client.email) ? data.client.email.trim() : '';
        if (!targetEmail && typeof AuthSubscription !== 'undefined' && AuthSubscription.currentUser) {
            targetEmail = AuthSubscription.currentUser.email || '';
        }

        let emitterName = (data.emitter && data.emitter.name) ? data.emitter.name.trim() : '';
        if (!emitterName && typeof AuthSubscription !== 'undefined' && AuthSubscription.currentUser) {
            emitterName = AuthSubscription.currentUser.displayName || AuthSubscription.currentUser.email || 'Emitia Pro';
        }

        const subject = encodeURIComponent(`${data.docType} N° ${data.number} - ${emitterName}`);
        const body = encodeURIComponent(
            `Estimado/a ${data.client.name || 'Cliente'},\n\n` +
            `Adjunto encontrará la ${data.docType.toLowerCase()} N° ${data.number}.\n\n` +
            `• Documento: ${data.docType} N° ${data.number}\n` +
            `• Total a Pagar: ${data.currencySymbol} ${data.totals.grandTotal.toLocaleString('es-CL', { minimumFractionDigits: 2 })}\n` +
            `• Fecha de Emisión: ${data.date}\n` +
            `• Fecha de Vencimiento: ${data.dueDate}\n\n` +
            `${data.bankDetails ? '📌 Datos de Pago / Transferencia Bancaria:\n' + data.bankDetails + '\n\n' : ''}` +
            `Saludos cordiales,\n` +
            `${emitterName}\n` +
            `${data.emitter.email ? data.emitter.email + '\n' : ''}` +
            `${data.emitter.phone ? data.emitter.phone : ''}`
        );

        window.open(`mailto:${targetEmail}?subject=${subject}&body=${body}`, '_self');
        showToast(targetEmail ? `Abriendo correo para: ${targetEmail}...` : 'Abriendo cliente de correo...', 'info');
    },

    initTheme() {
        const savedTheme = localStorage.getItem('emitia_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = document.getElementById('theme-icon') || document.getElementById('theme-toggle-icon');
        if (icon) {
            icon.className = savedTheme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        const btn = document.getElementById('btn-theme-toggle');
        if (btn && !btn.dataset.bound) {
            btn.dataset.bound = 'true';
            btn.addEventListener('click', () => this.toggleTheme());
        }
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('emitia_theme', next);
        const icon = document.getElementById('theme-icon') || document.getElementById('theme-toggle-icon');
        if (icon) {
            icon.className = next === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        showToast(next === 'light' ? '☀️ Modo Claro activado' : '🌙 Modo Oscuro activado', 'info');
    },

    sendPaymentReminder(docNumber) {
        const history = StorageManager.getHistory();
        const doc = history.find(h => h.number === docNumber);
        if (!doc) return;

        let targetEmail = (doc.client && doc.client.email) ? doc.client.email.trim() : '';
        if (!targetEmail && typeof AuthSubscription !== 'undefined' && AuthSubscription.currentUser) {
            targetEmail = AuthSubscription.currentUser.email || '';
        }

        const emitterName = (doc.emitter && doc.emitter.name) ? doc.emitter.name : 'Emitia Pro';
        const clientName = (doc.client && doc.client.name) ? doc.client.name : 'Estimado/a Cliente';
        const isOverdue = doc.dueDate && new Date(doc.dueDate) < new Date();
        const subject = encodeURIComponent(`📌 ${isOverdue ? 'RECORDATORIO DE PAGO VENCIDO' : 'RECORDATORIO DE COBRO'}: ${doc.docType} N° ${doc.number} - ${emitterName}`);

        const flowUrl = `https://www.flow.cl/uri/0BTj8Mtxz${targetEmail ? '?email=' + encodeURIComponent(targetEmail) : ''}`;

        const body = encodeURIComponent(
            `Estimado/a ${clientName},\n\n` +
            `Le saludamos cordialmente de ${emitterName}.\n\n` +
            `Le recordamos que el documento ${doc.docType} N° ${doc.number} por un monto total de ${doc.currencySymbol} ${doc.totals.grandTotal.toLocaleString('es-CL', { minimumFractionDigits: 2 })} ` +
            `${isOverdue ? 'se encuentra VENCIDO desde el ' + doc.dueDate : 'registra fecha de vencimiento el ' + doc.dueDate}.\n\n` +
            `💳 Para su comodidad, puede realizar el pago en línea mediante Webpay/Flow a través del siguiente enlace seguro:\n` +
            `${flowUrl}\n\n` +
            `${doc.bankDetails ? '📌 O mediante transferencia bancaria a los siguientes datos:\n' + doc.bankDetails + '\n\n' : ''}` +
            `Agradecemos responder a este correo adjuntando el comprobante de pago una vez realizado.\n\n` +
            `Atentamente,\n` +
            `${emitterName}\n` +
            `${doc.emitter && doc.emitter.phone ? doc.emitter.phone : ''}`
        );

        window.open(`mailto:${targetEmail}?subject=${subject}&body=${body}`, '_self');
        showToast(targetEmail ? `Abriendo correo de cobranza para: ${targetEmail}...` : 'Abriendo cliente de correo...', 'info');
    }
};

// Safe Initialization after App definition
const initAppModule = () => {
    App.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppModule);
} else {
    initAppModule();
}
