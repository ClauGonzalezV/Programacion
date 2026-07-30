/* ==========================================================================
   TEMPLATES ENGINE - RENDERS LIVE DOCUMENT PREVIEW
   ========================================================================== */

const TemplatesEngine = {
    renderDocument(data, container) {
        if (!container) return;

        // Apply template variation class & dynamic accent color
        container.className = `document-paper template-${data.template || 'modern'}`;
        container.setAttribute('data-accent', data.accentColor || '#4f46e5');
        container.style.setProperty('--accent-color', data.accentColor || '#4f46e5');

        // Currency formatting helper
        const formatMoney = (amount) => {
            const val = parseFloat(amount) || 0;
            const currencySymbol = data.currencySymbol || '$';
            return `${currencySymbol} ${val.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        // Format dates
        const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateStr;
        };

        // Render Rows HTML
        let rowsHtml = '';
        if (data.items && data.items.length > 0) {
            rowsHtml = data.items.map((item, idx) => {
                const qty = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.price) || 0;
                const total = qty * price;
                return `
                    <tr>
                        <td><strong>${this.escapeHtml(item.description || 'Concepto')}</strong></td>
                        <td class="text-center">${qty}</td>
                        <td class="text-right">${formatMoney(price)}</td>
                        <td class="text-right"><strong>${formatMoney(total)}</strong></td>
                    </tr>
                `;
            }).join('');
        } else {
            rowsHtml = `
                <tr>
                    <td colspan="4" class="text-center" style="color: #94a3b8; padding: 24px;">
                        <em>Sin conceptos agregados. Añade ítems en el formulario.</em>
                    </td>
                </tr>
            `;
        }

        // Render Status Tag style
        let statusBg = '#64748b';
        let statusColor = '#ffffff';
        if (data.status === 'Pendiente') { statusBg = '#f59e0b'; }
        else if (data.status === 'Aprobada') { statusBg = '#0ea5e9'; }
        else if (data.status === 'Pagada') { statusBg = '#10b981'; }

        // Full Document Template HTML
        const html = `
            <!-- Document Header -->
            <div class="doc-header-grid">
                <div class="doc-emitter-info">
                    ${data.emitter.logo ? `<img src="${data.emitter.logo}" class="doc-emitter-logo" alt="Logo">` : ''}
                    <h2 class="doc-emitter-name">${this.escapeHtml(data.emitter.name || 'Mi Empresa / Freelancer')}</h2>
                    ${data.emitter.taxId ? `<div class="doc-emitter-sub"><strong>RUT/NIF:</strong> ${this.escapeHtml(data.emitter.taxId)}</div>` : ''}
                    ${data.emitter.email ? `<div class="doc-emitter-sub"><i class="fa-regular fa-envelope"></i> ${this.escapeHtml(data.emitter.email)}</div>` : ''}
                    ${data.emitter.phone ? `<div class="doc-emitter-sub"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(data.emitter.phone)}</div>` : ''}
                    ${data.emitter.address ? `<div class="doc-emitter-sub"><i class="fa-solid fa-location-dot"></i> ${this.escapeHtml(data.emitter.address)}</div>` : ''}
                </div>

                <div class="doc-type-badge">
                    <div class="doc-type-title">${data.docType}</div>
                    <div class="doc-number">N° ${this.escapeHtml(data.number)}</div>
                    <div class="doc-status-tag" style="background-color: ${statusBg}; color: ${statusColor};">${data.status}</div>
                </div>
            </div>

            <!-- Dates & Validity -->
            <div class="doc-meta-dates">
                <div class="doc-meta-item">Fecha Emisión: <span>${formatDate(data.date)}</span></div>
                <div class="doc-meta-item">Vencimiento / Validez: <span>${formatDate(data.dueDate)}</span></div>
                <div class="doc-meta-item">Moneda: <span>${data.currency}</span></div>
            </div>

            <!-- Client Info Card -->
            <div class="doc-parties-grid">
                <div>
                    <div class="party-title">Facturado A / Cliente:</div>
                    <div class="party-name">${this.escapeHtml(data.client.name || 'Nombre del Cliente')}</div>
                    ${data.client.taxId ? `<div class="party-detail"><strong>RUT/NIF:</strong> ${this.escapeHtml(data.client.taxId)}</div>` : ''}
                    ${data.client.email ? `<div class="party-detail"><i class="fa-regular fa-envelope"></i> ${this.escapeHtml(data.client.email)}</div>` : ''}
                    ${data.client.phone ? `<div class="party-detail"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(data.client.phone)}</div>` : ''}
                    ${data.client.address ? `<div class="party-detail"><i class="fa-solid fa-location-dot"></i> ${this.escapeHtml(data.client.address)}</div>` : ''}
                </div>
                <div>
                    <div class="party-title">Emitido Por:</div>
                    <div class="party-name">${this.escapeHtml(data.emitter.name || 'Emisor')}</div>
                    <div class="party-detail">${this.escapeHtml(data.emitter.email || '')}</div>
                </div>
            </div>

            <!-- Table of Items -->
            <table class="doc-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Descripción</th>
                        <th class="text-center" style="width: 12%;">Cant.</th>
                        <th class="text-right" style="width: 18%;">Precio Unit.</th>
                        <th class="text-right" style="width: 20%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <!-- Summary & Totals -->
            <div class="doc-summary-grid">
                <!-- Notes & Terms Column -->
                <div class="doc-notes-block">
                    ${data.bankDetails ? `
                        <div class="note-box">
                            <div class="note-box-title"><i class="fa-solid fa-building-columns"></i> Datos de Pago:</div>
                            <div style="white-space: pre-line;">${this.escapeHtml(data.bankDetails)}</div>
                        </div>
                    ` : ''}
                    
                    ${data.terms ? `
                        <div class="note-box">
                            <div class="note-box-title"><i class="fa-solid fa-info-circle"></i> Condiciones:</div>
                            <div style="white-space: pre-line;">${this.escapeHtml(data.terms)}</div>
                        </div>
                    ` : ''}

                    ${data.customNotes ? `
                        <div class="note-box" style="border-left-color: var(--success-color);">
                            <div style="font-weight: 600; color: #1e293b;">${this.escapeHtml(data.customNotes)}</div>
                        </div>
                    ` : ''}
                </div>

                <!-- Totals Calculation Table -->
                <div>
                    <table class="doc-totals-table">
                        <tr>
                            <td class="label">Subtotal:</td>
                            <td class="val">${formatMoney(data.totals.subtotal)}</td>
                        </tr>
                        ${data.totals.discountVal > 0 ? `
                            <tr>
                                <td class="label">Descuento (${data.discountType === 'percent' ? data.discountVal + '%' : 'Fijo'}):</td>
                                <td class="val" style="color: #ef4444;">-${formatMoney(data.totals.discountAmount)}</td>
                            </tr>
                        ` : ''}
                        ${data.taxRate > 0 ? `
                            <tr>
                                <td class="label">IVA / Impuesto (${data.taxRate}%):</td>
                                <td class="val">${formatMoney(data.totals.taxAmount)}</td>
                            </tr>
                        ` : ''}
                        ${data.totals.shippingFee > 0 ? `
                            <tr>
                                <td class="label">Envío / Gastos:</td>
                                <td class="val">${formatMoney(data.totals.shippingFee)}</td>
                            </tr>
                        ` : ''}
                        <tr class="grand-total">
                            <td class="label" style="color: var(--accent-color);">TOTAL:</td>
                            <td class="val">${formatMoney(data.totals.grandTotal)}</td>
                        </tr>
                    </table>
                    
                    <!-- Amount in words line -->
                    <div class="doc-amount-words">
                        <i class="fa-solid fa-file-invoice-dollar"></i> ${this.numberToWordsSpanish(data.totals.grandTotal, data.currency)}
                    </div>
                </div>
            </div>

            <!-- Footer Signature -->
            <div class="doc-footer">
                <div>Documento generado con FacturaPulse Pro</div>
                <div class="signature-line">Firma y Sello del Emisor</div>
            </div>
        `;

        container.innerHTML = html;
    },

    numberToWordsSpanish(num, currency = 'USD') {
        if (num === null || num === undefined || isNaN(num)) return '';
        const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
        const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

        const convertGroup = (n) => {
            let output = '';
            if (n === 100) return 'CIEN';
            if (n > 100) {
                output += hundreds[Math.floor(n / 100)] + ' ';
                n %= 100;
            }
            if (n >= 10 && n <= 19) {
                output += teens[n - 10] + ' ';
            } else if (n >= 20 && n <= 29) {
                if (n === 20) output += 'VEINTE ';
                else output += 'VEINTI' + units[n - 20] + ' ';
            } else if (n >= 30) {
                output += tens[Math.floor(n / 10)];
                if (n % 10 !== 0) output += ' Y ' + units[n % 10];
                output += ' ';
            } else if (n > 0) {
                output += units[n] + ' ';
            }
            return output;
        };

        let integerPart = Math.floor(Math.abs(num));
        const cents = Math.round((Math.abs(num) - integerPart) * 100);
        const centsStr = (cents < 10 ? '0' : '') + cents;

        if (integerPart === 0) return `SON: CERO CON ${centsStr}/100 ${currency}`;

        let words = '';
        if (integerPart >= 1000000) {
            const millions = Math.floor(integerPart / 1000000);
            integerPart %= 1000000;
            words += (millions === 1 ? 'UN MILLÓN ' : convertGroup(millions) + 'MILLONES ');
        }
        if (integerPart >= 1000) {
            const thousands = Math.floor(integerPart / 1000);
            integerPart %= 1000;
            words += (thousands === 1 ? 'UN MIL ' : convertGroup(thousands) + 'MIL ');
        }
        if (integerPart > 0) {
            words += convertGroup(integerPart);
        }

        return `SON: ${words.trim()} CON ${centsStr}/100 ${currency}`;
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};
