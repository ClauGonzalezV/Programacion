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
        this.initEmitterProfiles();
        this.initAccordions();
        this.renderInitialItemRows();
        this.recalculateAndRender();
    },

    initAccordions() {
        const cardBoxes = document.querySelectorAll('#invoice-form .card-box');
        cardBoxes.forEach(card => {
            const header = card.querySelector('.card-box-header');
            if (!header) return;

            // Remove legacy icons and duplicate chevron elements to leave strictly ONE indicator
            const legacyIcons = header.querySelectorAll('.card-collapse-icon');
            legacyIcons.forEach(ic => ic.remove());

            const icons = header.querySelectorAll('.accordion-chevron-icon, .fa-chevron-right, .fa-chevron-down, svg[data-icon="chevron-right"], svg[data-icon="chevron-down"]');
            if (icons.length > 1) {
                for (let i = 1; i < icons.length; i++) {
                    icons[i].remove();
                }
            } else if (icons.length === 0) {
                const chevron = document.createElement('i');
                chevron.className = 'fa-solid fa-chevron-right accordion-chevron-icon';
                header.appendChild(chevron);
            } else {
                icons[0].classList.add('accordion-chevron-icon');
            }

            // All section cards start collapsed (closed) by default on load
            card.classList.remove('is-open');

            if (!header.dataset.accordionBound) {
                header.dataset.accordionBound = 'true';
                header.addEventListener('click', (e) => {
                    if (e.target.closest('button, input, select, label, .header-tools, .toggle-switch-btn')) {
                        return;
                    }
                    card.classList.toggle('is-open');
                });
            }
        });
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

        // 1. Real-time sanitization for Phone fields (numbers, +, spaces, hyphens, parentheses only)
        ['input-emitter-phone', 'input-client-phone', 'modal-client-phone'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute('type', 'tel');
                el.setAttribute('inputmode', 'tel');
                el.addEventListener('input', () => {
                    el.value = el.value.replace(/[^0-9+\s\-()]/g, '');
                });
            }
        });

        // 2. Real-time sanitization for RUT fields (numbers, K, dots, hyphens only)
        ['input-emitter-taxid', 'input-client-taxid', 'modal-client-taxid'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute('inputmode', 'text');
                el.addEventListener('input', () => {
                    el.value = el.value.replace(/[^0-9kK\.\-]/g, '');
                });
                el.addEventListener('blur', () => {
                    if (el.value.trim()) {
                        el.value = this.formatRut(el.value);
                        this.recalculateAndRender();
                    }
                });
            }
        });

        // 3. Real-time sanitization for Price, Tax, Shipping & Discount numeric fields (positive numbers/decimals only)
        ['input-tax-rate', 'input-discount-val', 'input-shipping-fee', 'modal-catalog-price'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute('type', 'number');
                el.setAttribute('inputmode', 'decimal');
                el.addEventListener('input', () => {
                    el.value = el.value.replace(/[^0-9\.]/g, '');
                });
            }
        });

        // Template Selector explicit change listener
        const templateSelect = document.getElementById('doc-template');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                const paperContainer = document.getElementById('document-paper');
                if (paperContainer) {
                    paperContainer.className = `document-paper template-${e.target.value}`;
                }
                this.recalculateAndRender();
            });
        }

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
                    
                    const companyName = document.getElementById('input-emitter-name') ? document.getElementById('input-emitter-name').value.trim() : '';
                    this.updateHeaderBrand(evt.target.result, companyName);
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
            
            const companyName = document.getElementById('input-emitter-name') ? document.getElementById('input-emitter-name').value.trim() : '';
            this.updateHeaderBrand('', companyName);
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

        const intQty = Math.max(1, Math.round(qty) || 1);

        tr.innerHTML = `
            <td>
                <input type="text" class="form-input item-desc" placeholder="Descripción del concepto / producto" value="${desc}">
            </td>
            <td>
                <input type="number" class="form-input item-qty text-center" value="${intQty}" min="1" step="1">
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

        // Force integer quantity on input and change
        const qtyInp = tr.querySelector('.item-qty');
        if (qtyInp) {
            qtyInp.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value && parseInt(e.target.value, 10) < 1) e.target.value = '1';
                this.recalculateAndRender();
            });
            qtyInp.addEventListener('change', (e) => {
                const val = parseInt(e.target.value, 10) || 1;
                e.target.value = Math.max(1, val);
                this.recalculateAndRender();
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
            const qtyInput = row.querySelector('.item-qty');
            const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
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
    },

    renderEmitterProfileOptions(selectedId) {
        const select = document.getElementById('select-emitter-profile');
        if (!select) return;
        const profiles = typeof StorageManager !== 'undefined' ? StorageManager.getEmitterProfiles() : [];
        select.innerHTML = profiles.map(p => `<option value="${p.id}">🏢 ${p.name || 'Empresa'}</option>`).join('');
        select.innerHTML += `<option value="new">➕ Crear Nuevo Perfil</option>`;
        if (selectedId) select.value = selectedId;
    },

    initEmitterProfiles() {
        const select = document.getElementById('select-emitter-profile');
        if (!select) return;

        this.renderEmitterProfileOptions();

        if (select.value && select.value !== 'new') {
            this.loadSelectedEmitterProfile(select.value);
        }

        if (!select.dataset.bound) {
            select.dataset.bound = 'true';
            select.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'new') {
                    document.getElementById('input-emitter-name').value = '';
                    document.getElementById('input-emitter-taxid').value = '';
                    document.getElementById('input-emitter-email').value = '';
                    document.getElementById('input-emitter-phone').value = '';
                    document.getElementById('input-emitter-address').value = '';
                    document.getElementById('input-emitter-name').focus();
                    if (typeof showToast === 'function') showToast('📝 Completa los campos y haz clic en "Guardar Perfil" para registrar tu nueva empresa.', 'info');
                } else {
                    this.loadSelectedEmitterProfile(val);
                    if (typeof showToast === 'function') showToast('🏢 Perfil de emisor cargado en el editor.', 'info');
                }
                this.recalculateAndRender();
            });
        }
    },

    loadSelectedEmitterProfile(profileId) {
        const profiles = typeof StorageManager !== 'undefined' ? StorageManager.getEmitterProfiles() : [];
        const found = profiles.find(p => p.id === profileId);
        if (!found) return;

        const nameEl = document.getElementById('input-emitter-name');
        const taxIdEl = document.getElementById('input-emitter-taxid');
        const emailEl = document.getElementById('input-emitter-email');
        const phoneEl = document.getElementById('input-emitter-phone');
        const addressEl = document.getElementById('input-emitter-address');
        const bankEl = document.getElementById('input-bank-details');

        if (nameEl) nameEl.value = found.name || '';
        if (taxIdEl) taxIdEl.value = found.taxId || '';
        if (emailEl) emailEl.value = found.email || '';
        if (phoneEl) phoneEl.value = found.phone || '';
        if (addressEl) addressEl.value = found.address || '';
        if (bankEl) bankEl.value = found.bankDetails || '';

        if (found.logo) {
            this.state.logoDataUrl = found.logo;
            const img = document.getElementById('logo-preview-img');
            const placeholder = document.getElementById('logo-placeholder');
            if (img && placeholder) {
                img.src = found.logo;
                img.classList.remove('hidden');
                placeholder.classList.add('hidden');
            }
        } else {
            this.state.logoDataUrl = '';
            const img = document.getElementById('logo-preview-img');
            const placeholder = document.getElementById('logo-placeholder');
            if (img && placeholder) {
                img.src = '';
                img.classList.add('hidden');
                placeholder.classList.remove('hidden');
            }
        }
        this.updateHeaderBrand(found.logo || '', found.name || '');
    },

    updateHeaderBrand(logoUrl, companyName) {
        const headerLogo = document.getElementById('header-custom-logo');
        const headerIcon = document.getElementById('header-default-icon');
        const headerSubtitle = document.getElementById('header-company-name');

        if (logoUrl && headerLogo && headerIcon) {
            headerLogo.src = logoUrl;
            headerLogo.classList.remove('hidden');
            headerIcon.classList.add('hidden');
        } else if (headerLogo && headerIcon) {
            headerLogo.src = '';
            headerLogo.classList.add('hidden');
            headerIcon.classList.remove('hidden');
        }

        if (headerSubtitle) {
            headerSubtitle.textContent = companyName ? companyName : 'Cotizaciones & Facturas Profesionales';
        }
    },

    formatRut(rut) {
        if (!rut) return '';
        let clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        if (clean.length < 2) return clean;
        let body = clean.slice(0, -1);
        let dv = clean.slice(-1);
        body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${body}-${dv}`;
    },

    isValidRut(rut) {
        if (!rut) return true;
        let clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        if (clean.length < 7 || clean.length > 10) return false;
        let body = clean.slice(0, -1);
        let dv = clean.slice(-1);
        let sum = 0;
        let multiplier = 2;
        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body.charAt(i), 10) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        let expectedDv = 11 - (sum % 11);
        let expectedDvChar = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);
        return dv === expectedDvChar;
    },

    isValidEmail(email) {
        if (!email) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    },

    isValidPhone(phone) {
        if (!phone) return true;
        return /^[\d\s+\-()]{6,20}$/.test(phone.trim());
    },

    saveCurrentAsEmitterProfile() {
        const nameEl = document.getElementById('input-emitter-name');
        const taxIdEl = document.getElementById('input-emitter-taxid');
        const emailEl = document.getElementById('input-emitter-email');
        const phoneEl = document.getElementById('input-emitter-phone');
        const addressEl = document.getElementById('input-emitter-address');
        const bankEl = document.getElementById('input-bank-details');

        const name = nameEl ? nameEl.value.trim() : '';
        if (!name || name.length < 2) {
            if (typeof showToast === 'function') showToast('⚠️ Escribe una Razón Social o Nombre de Empresa válido para guardar.', 'error');
            if (nameEl) nameEl.focus();
            return null;
        }

        const taxId = taxIdEl ? taxIdEl.value.trim() : '';
        if (taxId && !this.isValidRut(taxId)) {
            if (typeof showToast === 'function') showToast('⚠️ La Identificación Fiscal (RUT) no es válida. (Ej: 76.123.456-7 o 12.345.678-K).', 'error');
            if (taxIdEl) taxIdEl.focus();
            return null;
        }

        const email = emailEl ? emailEl.value.trim() : '';
        if (email && !this.isValidEmail(email)) {
            if (typeof showToast === 'function') showToast('⚠️ El Correo Electrónico ingresado no es válido (ej: contacto@empresa.com).', 'error');
            if (emailEl) emailEl.focus();
            return null;
        }

        const phone = phoneEl ? phoneEl.value.trim() : '';
        if (phone && !this.isValidPhone(phone)) {
            if (typeof showToast === 'function') showToast('⚠️ El Teléfono ingresado no es válido (ej: +56 9 1234 5678).', 'error');
            if (phoneEl) phoneEl.focus();
            return null;
        }

        const profileId = `prof-${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const profileData = {
            id: profileId,
            name: name,
            taxId: taxId ? this.formatRut(taxId) : '',
            email: email,
            phone: phone,
            address: addressEl ? addressEl.value.trim() : '',
            bankDetails: bankEl ? bankEl.value.trim() : '',
            logo: this.state.logoDataUrl || ''
        };

        if (taxIdEl && profileData.taxId) taxIdEl.value = profileData.taxId;

        if (typeof StorageManager !== 'undefined') {
            StorageManager.saveMultiEmitterProfile(profileData);
            this.renderEmitterProfileOptions(profileId);
            this.recalculateAndRender();
            if (typeof showToast === 'function') showToast(`🏢 Perfil de empresa "${name}" guardado exitosamente.`, 'success');
        }
        return profileId;
    },

    deleteCurrentEmitterProfile() {
        const select = document.getElementById('select-emitter-profile');
        if (!select) return;

        const profileId = select.value;
        if (!profileId || profileId === 'new') {
            if (typeof showToast === 'function') showToast('⚠️ Selecciona un perfil guardado para eliminar.', 'info');
            return;
        }

        const profiles = typeof StorageManager !== 'undefined' ? StorageManager.getEmitterProfiles() : [];
        const found = profiles.find(p => p.id === profileId);
        const profileName = found ? found.name : 'Perfil';

        if (!confirm(`¿Estás seguro de que deseas eliminar el perfil de empresa "${profileName}"?`)) {
            return;
        }

        if (typeof StorageManager !== 'undefined') {
            StorageManager.deleteMultiEmitterProfile(profileId);
        }

        const remaining = typeof StorageManager !== 'undefined' ? StorageManager.getEmitterProfiles() : [];
        const nextSelected = remaining.length > 0 ? remaining[0].id : null;

        this.renderEmitterProfileOptions(nextSelected);

        if (nextSelected) {
            this.loadSelectedEmitterProfile(nextSelected);
        } else {
            ['input-emitter-name', 'input-emitter-taxid', 'input-emitter-email', 'input-emitter-phone', 'input-emitter-address', 'input-bank-details'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.state.logoDataUrl = '';
            const img = document.getElementById('logo-preview-img');
            const placeholder = document.getElementById('logo-placeholder');
            if (img && placeholder) {
                img.src = '';
                img.classList.add('hidden');
                placeholder.classList.remove('hidden');
            }
        }

        this.recalculateAndRender();
        if (typeof showToast === 'function') showToast(`🗑️ Perfil de empresa "${profileName}" eliminado exitosamente de la base de datos.`, 'success');
    }
};
