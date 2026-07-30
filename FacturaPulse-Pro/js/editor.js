/* ==========================================================================
   EDITOR MODULE - FORM CONTROLS, CALCULATIONS & ITEM ROWS
   ========================================================================== */

const EditorModule = {
    state: {
        logoDataUrl: '',
        accentColor: '#4f46e5',
        currencySymbol: '$'
    },

    init() {
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
        // Input change handlers for live updates
        const inputsToListen = [
            'doc-type', 'doc-currency', 'doc-template', 'input-doc-number', 'input-doc-status',
            'input-doc-date', 'input-doc-duedate', 'input-emitter-name', 'input-emitter-taxid',
            'input-emitter-email', 'input-emitter-phone', 'input-emitter-address',
            'input-client-name', 'input-client-taxid', 'input-client-email', 'input-client-phone',
            'input-client-address', 'input-tax-rate', 'input-discount-val', 'input-discount-type',
            'input-shipping-fee', 'input-bank-details', 'input-terms-conditions', 'input-custom-notes'
        ];

        inputsToListen.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.recalculateAndRender());
                el.addEventListener('change', () => this.recalculateAndRender());
            }
        });

        // Currency change symbol update
        document.getElementById('doc-currency').addEventListener('change', (e) => {
            const opt = e.target.options[e.target.selectedIndex];
            this.state.currencySymbol = opt.dataset.symbol || '$';
            this.recalculateAndRender();
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

        // Sample Data Button
        document.getElementById('btn-sample-data').addEventListener('click', () => this.loadSampleData());

        // Reset Button
        document.getElementById('btn-reset-form').addEventListener('click', () => this.resetForm());
    },

    renderInitialItemRows() {
        const tbody = document.getElementById('items-tbody');
        tbody.innerHTML = '';
        this.addItemRow('Servicio de Diseño y Desarrollo Web Frontend & Backend', 1, 850);
        this.addItemRow('Configuración de Servidor, Dominio y Certificado SSL', 1, 150);
    },

    addItemRow(desc = '', qty = 1, price = 0) {
        const tbody = document.getElementById('items-tbody');
        const tr = document.createElement('tr');
        tr.className = 'editor-item-row';
        tr.innerHTML = `
            <td>
                <input type="text" class="form-input item-desc" placeholder="Descripción del concepto" value="${desc}">
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

        // Listen for row edits
        tr.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', () => this.recalculateAndRender());
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

            row.querySelector('.item-row-total').textContent = `${this.state.currencySymbol} ${rowTotal.toLocaleString('es-CL', { minimumFractionDigits: 2 })}`;

            if (desc || qty > 0) {
                items.push({ description: desc, quantity: qty, price: price });
                subtotal += rowTotal;
            }
        });

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
        const taxAmount = subtotalAfterDiscount * (taxRate / 100);
        const grandTotal = subtotalAfterDiscount + taxAmount + shippingFee;

        return {
            docType: document.getElementById('doc-type').value,
            currency: document.getElementById('doc-currency').value,
            currencySymbol: this.state.currencySymbol,
            template: document.getElementById('doc-template').value,
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
            totals: {
                subtotal,
                discountVal,
                discountType,
                discountAmount,
                taxAmount,
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
        this.recalculateAndRender();
        if (typeof showToast === 'function') {
            showToast('Formulario limpiado', 'info');
        }
    }
};
