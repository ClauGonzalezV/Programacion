/* ==========================================================================
   EDITOR MODULE - FORM CONTROLS, CALCULATIONS & ITEM ROWS
   ========================================================================== */

const EditorModule = {
    state: {
        logoDataUrl: '',
        accentColor: '#4f46e5',
        currencySymbol: '$',
        signatureDataUrl: '',
        signatureIsDrawing: false,
        attachments: []
    },

    init() {
        const currencySelect = document.getElementById('doc-currency');
        if (currencySelect) {
            currencySelect.value = 'CLP';
            const opt = currencySelect.options[currencySelect.selectedIndex];
            if (opt) this.state.currencySymbol = opt.dataset.symbol || '$';
        }
        this.setDefaultDates();
        this.bindEvents();
        this.renderInitialItemRows();
        this.recalculateAndRender();
    },

    setDefaultDates() {
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 15);

        document.getElementById('input-doc-date').value = today.toISOString().slice(0, 10);
        document.getElementById('input-doc-duedate').value = dueDate.toISOString().slice(0, 10);
    },

    bindEvents() {
        // Tax Preset Selector Handler
        const taxPresetSelect = document.getElementById('select-tax-preset');
        const taxRateInput = document.getElementById('input-tax-rate');
        if (taxPresetSelect && taxRateInput) {
            taxPresetSelect.addEventListener('change', () => {
                const val = taxPresetSelect.value;
                if (val === 'iva_19') taxRateInput.value = '19';
                if (val === 'ret_1375') taxRateInput.value = '13.75';
                if (val === 'iva_16') taxRateInput.value = '16';
                if (val === 'iva_21') taxRateInput.value = '21';
                if (val === 'exempt') taxRateInput.value = '0';
                this.recalculateAndRender();
            });
        }

        // Attachments File Input Handler (Feature 15)
        const btnAttach = document.getElementById('btn-trigger-attachment');
        const fileAttachInput = document.getElementById('input-attachment-files');
        if (btnAttach && fileAttachInput) {
            btnAttach.addEventListener('click', () => fileAttachInput.click());
            fileAttachInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(f => {
                    this.state.attachments.push({
                        name: f.name,
                        size: (f.size / 1024).toFixed(1) + ' KB'
                    });
                });
                fileAttachInput.value = '';
                this.renderAttachmentsList();
                this.recalculateAndRender();
            });
        }

        // Input change handlers for live updates
        const inputsToListen = [
            'doc-type', 'doc-currency', 'doc-template', 'doc-watermark', 'doc-language',
            'input-doc-number', 'input-doc-status', 'select-tax-preset',
            'input-doc-date', 'input-doc-duedate', 'input-emitter-name', 'input-emitter-taxid',
            'input-emitter-email', 'input-emitter-phone', 'input-emitter-address',
            'input-client-name', 'input-client-taxid', 'input-client-email', 'input-client-phone',
            'input-client-address', 'input-tax-rate', 'input-discount-val', 'input-discount-type',
            'input-shipping-fee', 'input-bank-details', 'input-terms-conditions', 'input-custom-notes',
            'input-qr-url', 'input-signer-name'
        ];

        inputsToListen.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.recalculateAndRender());
                el.addEventListener('change', () => this.recalculateAndRender());
            }
        });

        // Template Selector explicit change listener & Chip Buttons sync
        const templateSelect = document.getElementById('doc-template');
        const syncTemplateState = (tmplVal) => {
            if (templateSelect) templateSelect.value = tmplVal;
            const paperContainer = document.getElementById('document-paper');
            if (paperContainer) {
                paperContainer.className = `document-paper template-${tmplVal}`;
            }
            document.querySelectorAll('.chip-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.template === tmplVal);
            });
            this.recalculateAndRender();
        };

        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                syncTemplateState(e.target.value);
            });
        }

        document.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tmpl = e.target.dataset.template;
                if (tmpl) syncTemplateState(tmpl);
            });
        });

        // Currency change symbol update
        document.getElementById('doc-currency').addEventListener('change', (e) => {
            const opt = e.target.options[e.target.selectedIndex];
            this.state.currencySymbol = opt.dataset.symbol || '$';
            this.recalculateAndRender();
        });

        // Auto-numbering on doc type change
        document.getElementById('doc-type').addEventListener('change', () => {
            this.autoSetDocNumber();
        });

        // Accent Color Dots
        document.querySelectorAll('.color-dot').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-dot').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.accentColor = e.target.dataset.color;
                this.recalculateAndRender();
            });
        });

        document.getElementById('custom-accent-color').addEventListener('input', (e) => {
            this.state.accentColor = e.target.value;
            this.recalculateAndRender();
        });

        // Add Item Row
        document.getElementById('btn-add-item').addEventListener('click', () => {
            this.addItemRow('', 1, 0);
            this.recalculateAndRender();
        });

        // Logo Upload
        const logoDropzone = document.getElementById('logo-dropzone');
        const logoFileInput = document.getElementById('input-logo-file');
        
        logoDropzone.addEventListener('click', (e) => {
            if (e.target.id !== 'btn-remove-logo' && !e.target.closest('#btn-remove-logo')) {
                logoFileInput.click();
            }
        });

        logoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.state.logoDataUrl = evt.target.result;
                    document.getElementById('logo-preview-img').src = evt.target.result;
                    document.getElementById('logo-preview-img').classList.remove('hidden');
                    document.getElementById('logo-placeholder').classList.add('hidden');
                    document.getElementById('btn-remove-logo').classList.remove('hidden');
                    this.recalculateAndRender();
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('btn-remove-logo').addEventListener('click', (e) => {
            e.stopPropagation();
            this.state.logoDataUrl = '';
            document.getElementById('input-logo-file').value = '';
            document.getElementById('logo-preview-img').src = '';
            document.getElementById('logo-preview-img').classList.add('hidden');
            document.getElementById('logo-placeholder').classList.remove('hidden');
            document.getElementById('btn-remove-logo').classList.add('hidden');
            this.recalculateAndRender();
        });

        // PDF Visibility Toggles
        ['toggle-show-bank-terms', 'toggle-show-signature', 'toggle-show-amount-words'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.recalculateAndRender());
        });

        // Sample Data Button
        document.getElementById('btn-sample-data').addEventListener('click', () => this.loadSampleData());

        // Reset Button
        document.getElementById('btn-reset-form').addEventListener('click', () => this.resetForm());

        // Signature Canvas
        this.initSignatureCanvas();
    },

    initSignatureCanvas() {
        const canvas = document.getElementById('signature-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const hint = document.getElementById('signature-hint');

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const src = e.touches ? e.touches[0] : e;
            return {
                x: (src.clientX - rect.left) * scaleX,
                y: (src.clientY - rect.top) * scaleY
            };
        };

        const startDraw = (e) => {
            e.preventDefault();
            this.state.signatureIsDrawing = true;
            if (hint) hint.style.display = 'none';
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        const draw = (e) => {
            e.preventDefault();
            if (!this.state.signatureIsDrawing) return;
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        };

        const endDraw = () => {
            if (!this.state.signatureIsDrawing) return;
            this.state.signatureIsDrawing = false;
            this.state.signatureDataUrl = canvas.toDataURL('image/png');
            this.recalculateAndRender();
        };

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseleave', endDraw);
        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', endDraw);

        const btnClearSig = document.getElementById('btn-clear-signature');
        if (btnClearSig) {
            btnClearSig.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.state.signatureDataUrl = '';
                if (hint) hint.style.display = 'flex';
                this.recalculateAndRender();
            });
        }
    },

    renderInitialItemRows() {
        const tbody = document.getElementById('items-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        this.addItemRow('Servicio de Diseño y Desarrollo Web Frontend & Backend', 1, 850);
        this.addItemRow('Configuración de Servidor, Dominio y Certificado SSL', 1, 150);
    },

    renderAttachmentsList() {
        const container = document.getElementById('attachments-list-container');
        if (!container) return;
        if (this.state.attachments.length === 0) {
            container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No hay archivos adjuntos.</span>';
            return;
        }
        container.innerHTML = this.state.attachments.map((att, idx) => `
            <div class="attachment-chip" style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-input); border:1px solid var(--border-color); padding:4px 10px; border-radius:16px; font-size:0.8rem; margin:3px 4px 3px 0;">
                <i class="fa-solid fa-file-arrow-down" style="color:var(--accent-color);"></i>
                <span>${att.name}</span>
                <small style="color:var(--text-muted);">(${att.size})</small>
                <button type="button" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.8rem; margin-left:4px;" onclick="EditorModule.removeAttachment(${idx})">&times;</button>
            </div>
        `).join('');
    },

    removeAttachment(idx) {
        this.state.attachments.splice(idx, 1);
        this.renderAttachmentsList();
        this.recalculateAndRender();
    },

    addItemRow(desc = '', qty = 1, price = 0, image = '') {
        const tbody = document.getElementById('items-tbody');
        const tr = document.createElement('tr');
        tr.className = 'editor-item-row';
        if (image) tr.dataset.image = image;

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="item-img-label" title="Adjuntar foto del producto" style="cursor: pointer; flex-shrink: 0;">
                        <input type="file" accept="image/*" class="item-img-input file-input-hidden">
                        <div class="item-img-preview" style="width: 32px; height: 32px; border-radius: 4px; border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center; background: var(--bg-input); overflow: hidden;">
                            ${image ? `<img src="${image}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-camera" style="font-size:0.75rem; color:var(--text-muted);"></i>`}
                        </div>
                    </label>
                    <input type="text" class="form-input item-desc" placeholder="Descripción del concepto / producto" value="${desc}">
                </div>
            </td>
            <td>
                <input type="number" class="form-input item-qty text-center" value="${qty}" min="0.1" step="0.1">
            </td>
            <td>
                <input type="number" class="form-input item-price text-right" value="${price}" min="0" step="0.01">
            </td>
            <td class="text-right item-row-total font-mono font-bold" style="padding: 0 10px; font-weight: 700;">
                $ 0.00
            </td>
            <td class="text-center">
                <button type="button" class="btn-remove-item" title="Eliminar ítem">&times;</button>
            </td>
        `;

        // Item photo reader
        const imgInput = tr.querySelector('.item-img-input');
        const imgPreview = tr.querySelector('.item-img-preview');
        if (imgInput) {
            imgInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        tr.dataset.image = evt.target.result;
                        imgPreview.innerHTML = `<img src="${evt.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
                        this.recalculateAndRender();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Listen for row edits
        tr.querySelectorAll('input').forEach(inp => {
            if (!inp.classList.contains('item-img-input')) {
                inp.addEventListener('input', () => this.recalculateAndRender());
            }
        });

        tr.querySelector('.btn-remove-item').addEventListener('click', () => {
            tr.remove();
            this.recalculateAndRender();
        });

        tbody.appendChild(tr);
    },

    getCollectFormData() {
        // Collect items
        const items = [];
        let subtotal = 0;

        document.querySelectorAll('.editor-item-row').forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const rowTotal = qty * price;
            const img = (row.dataset && row.dataset.image) ? row.dataset.image : '';

            row.querySelector('.item-row-total').textContent = `${this.state.currencySymbol} ${rowTotal.toLocaleString('es-CL', { minimumFractionDigits: 2 })}`;

            if (desc || qty > 0) {
                items.push({ description: desc, quantity: qty, price: price, image: img });
                subtotal += rowTotal;
            }
        });

        const taxPresetEl = document.getElementById('select-tax-preset');
        const taxPreset = taxPresetEl ? taxPresetEl.value : 'iva_19';
        const taxRate = parseFloat(document.getElementById('input-tax-rate').value) || 0;
        const discountVal = parseFloat(document.getElementById('input-discount-val').value) || 0;
        const discountType = document.getElementById('input-discount-type').value;
        const shippingFee = parseFloat(document.getElementById('input-shipping-fee').value) || 0;

        let discountAmount = 0;
        if (discountType === 'percent') {
            discountAmount = subtotal * (discountVal / 100);
        } else {
            discountAmount = discountVal;
        }

        const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
        const isRetention = taxPreset === 'ret_1375';
        const taxAmount = subtotalAfterDiscount * (taxRate / 100);

        let grandTotal = 0;
        let taxLabel = `IVA (${taxRate}%)`;

        if (isRetention) {
            grandTotal = Math.max(0, subtotalAfterDiscount - taxAmount + shippingFee);
            taxLabel = `Retención Honorarios (${taxRate}%)`;
        } else if (taxPreset === 'exempt') {
            grandTotal = subtotalAfterDiscount + shippingFee;
            taxLabel = `Exento (0%)`;
        } else {
            grandTotal = subtotalAfterDiscount + taxAmount + shippingFee;
            if (taxPreset === 'iva_16') taxLabel = `IVA (16%)`;
            if (taxPreset === 'iva_21') taxLabel = `IVA (21%)`;
            if (taxPreset === 'custom') taxLabel = `Impuesto (${taxRate}%)`;
        }

        return {
            docType: document.getElementById('doc-type').value,
            currency: document.getElementById('doc-currency').value,
            currencySymbol: this.state.currencySymbol,
            template: document.getElementById('doc-template').value,
            watermark: document.getElementById('doc-watermark') ? document.getElementById('doc-watermark').value : '',
            language: document.getElementById('doc-language') ? document.getElementById('doc-language').value : 'es',
            accentColor: this.state.accentColor,
            number: document.getElementById('input-doc-number').value || 'COT-001',
            status: document.getElementById('input-doc-status').value,
            date: document.getElementById('input-doc-date').value,
            dueDate: document.getElementById('input-doc-duedate').value,
            emitter: {
                logo: this.state.logoDataUrl,
                name: document.getElementById('input-emitter-name').value,
                taxId: document.getElementById('input-emitter-taxid').value,
                email: document.getElementById('input-emitter-email').value,
                phone: document.getElementById('input-emitter-phone').value,
                address: document.getElementById('input-emitter-address').value
            },
            client: {
                name: document.getElementById('input-client-name').value,
                taxId: document.getElementById('input-client-taxid').value,
                email: document.getElementById('input-client-email').value,
                phone: document.getElementById('input-client-phone').value,
                address: document.getElementById('input-client-address').value
            },
            items: items,
            taxRate: taxRate,
            discountVal: discountVal,
            discountType: discountType,
            bankDetails: document.getElementById('input-bank-details').value,
            terms: document.getElementById('input-terms-conditions').value,
            customNotes: document.getElementById('input-custom-notes').value,
            qrUrl: document.getElementById('input-qr-url') ? document.getElementById('input-qr-url').value : '',
            signerName: document.getElementById('input-signer-name') ? document.getElementById('input-signer-name').value : '',
            signature: this.state.signatureDataUrl,
            showBankTerms: document.getElementById('toggle-show-bank-terms') ? document.getElementById('toggle-show-bank-terms').checked : true,
            showSignature: document.getElementById('toggle-show-signature') ? document.getElementById('toggle-show-signature').checked : true,
            showAmountWords: document.getElementById('toggle-show-amount-words') ? document.getElementById('toggle-show-amount-words').checked : true,
            taxPreset,
            taxLabel,
            isRetention,
            attachments: this.state.attachments || [],
            totals: {
                subtotal,
                discountVal,
                discountType,
                discountAmount,
                taxAmount,
                taxLabel,
                isRetention,
                shippingFee,
                grandTotal
            }
        };
    },

    recalculateAndRender() {
        const data = this.getCollectFormData();
        const paperContainer = document.getElementById('document-paper');
        TemplatesEngine.renderDocument(data, paperContainer);
    },

    loadSampleData() {
        document.getElementById('input-emitter-name').value = 'Nexus Digital Studio SpA';
        document.getElementById('input-emitter-taxid').value = '77.456.890-1';
        document.getElementById('input-emitter-email').value = 'contacto@nexusstudio.cl';
        document.getElementById('input-emitter-phone').value = '+56 9 6123 4567';
        document.getElementById('input-emitter-address').value = 'Av. Providencia 1234, Of 502, Santiago';

        document.getElementById('input-client-name').value = 'Innova Tech Solutions';
        document.getElementById('input-client-taxid').value = '76.890.123-5';
        document.getElementById('input-client-email').value = 'facturacion@innovatech.cl';
        document.getElementById('input-client-phone').value = '+56 9 7654 3210';
        document.getElementById('input-client-address').value = 'Av. Andrés Bello 2457, Providencia';

        document.getElementById('input-bank-details').value = 'Banco Santander Chile\nCuenta Corriente N° 88-12345-0\nTitular: Nexus Digital Studio SpA\nRut: 77.456.890-1\nEmail: pagos@nexusstudio.cl';
        document.getElementById('input-terms-conditions').value = '1. Cotización válida por 15 días corridos.\n2. Forma de pago: 50% de anticipo y 50% al entregar.\n3. Incluye 3 meses de garantía en código y soporte.';
        document.getElementById('input-custom-notes').value = '¡Gracias por su preferencia! Esperamos trabajar juntos en este proyecto.';

        const tbody = document.getElementById('items-tbody');
        tbody.innerHTML = '';
        this.addItemRow('Diseño UI/UX y maquetación responsiva de sitio web', 1, 600);
        this.addItemRow('Desarrollo de módulos e integración de API de pagos', 1, 450);
        this.addItemRow('Capacitación de personal y entrega de documentación', 1, 150);

        this.recalculateAndRender();
        if (typeof showToast === 'function') {
            showToast('Datos de prueba cargados correctamente', 'success');
        }
    },

    resetForm() {
        document.getElementById('invoice-form').reset();
        document.getElementById('items-tbody').innerHTML = '';
        this.renderInitialItemRows();
        this.setDefaultDates();
        this.autoSetDocNumber();
        const canvas = document.getElementById('signature-canvas');
        if (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.state.signatureDataUrl = '';
            const hint = document.getElementById('signature-hint');
            if (hint) hint.style.display = 'flex';
        }
        this.recalculateAndRender();
        if (typeof showToast === 'function') {
            showToast('Formulario listo para nuevo documento', 'info');
        }
    },

    getUserCounterKey() {
        const uid = typeof AuthSubscription !== 'undefined' && AuthSubscription.currentUser 
            ? AuthSubscription.currentUser.uid || AuthSubscription.currentUser.email 
            : 'guest';
        return `facturapulse_counters_${uid.replace(/[^a-zA-Z0-9]/g, '_')}`;
    },

    // Feature 5: Auto-numbering
    autoSetDocNumber() {
        const docType = document.getElementById('doc-type').value;
        const prefixes = {
            'COTIZACIÓN': 'COT', 'PRESUPUESTO': 'PRE', 'FACTURA': 'FAC',
            'RECIBO': 'REC', 'NOTA DE CRÉDITO': 'NC', 'NOTA DE DÉBITO': 'ND',
            'ORDEN DE COMPRA': 'OC', 'PROFORMA': 'PRO', 'CONTRATO': 'CTR'
        };
        const prefix = prefixes[docType] || 'DOC';
        const counterKey = this.getUserCounterKey();
        const counters = JSON.parse(localStorage.getItem(counterKey) || '{}');
        const history = typeof StorageManager !== 'undefined' ? StorageManager.getHistory() : [];
        
        let maxNum = counters[docType] || 0;
        history.forEach(doc => {
            if (doc.docType === docType && doc.number) {
                const match = doc.number.match(/(\d+)(?=[^\d]*$)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            }
        });

        const nextNum = Math.max(1, maxNum > 0 ? maxNum : 1);
        const padded = String(nextNum).padStart(3, '0');
        const year = new Date().getFullYear();
        document.getElementById('input-doc-number').value = `${prefix}-${year}-${padded}`;
        this.recalculateAndRender();
    },

    // Increment counter after saving and set input field to next folio (e.g. COT-2026-002)
    incrementDocCounter(docType) {
        const docTypeVal = docType || document.getElementById('doc-type').value;
        const prefixes = {
            'COTIZACIÓN': 'COT', 'PRESUPUESTO': 'PRE', 'FACTURA': 'FAC',
            'RECIBO': 'REC', 'NOTA DE CRÉDITO': 'NC', 'NOTA DE DÉBITO': 'ND',
            'ORDEN DE COMPRA': 'OC', 'PROFORMA': 'PRO', 'CONTRATO': 'CTR'
        };
        const prefix = prefixes[docTypeVal] || 'DOC';
        const counterKey = this.getUserCounterKey();
        const counters = JSON.parse(localStorage.getItem(counterKey) || '{}');
        const history = typeof StorageManager !== 'undefined' ? StorageManager.getHistory() : [];
        
        let maxNum = counters[docTypeVal] || 0;
        history.forEach(doc => {
            if (doc.docType === docTypeVal && doc.number) {
                const match = doc.number.match(/(\d+)(?=[^\d]*$)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            }
        });

        const nextNum = maxNum + 1;
        counters[docTypeVal] = nextNum;
        localStorage.setItem(counterKey, JSON.stringify(counters));

        const padded = String(nextNum).padStart(3, '0');
        const year = new Date().getFullYear();
        const nextFolio = `${prefix}-${year}-${padded}`;
        document.getElementById('input-doc-number').value = nextFolio;
        this.recalculateAndRender();
    }
};
