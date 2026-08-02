/* ==========================================================================
   TEMPLATES ENGINE - AUTO-PAGINATING DOCUMENT RENDERER v3.0
   Supports: Multi-page, Watermark, i18n, 15 templates
   ========================================================================== */

const TemplatesEngine = {
    ITEMS_PAGE_1: 5,
    ITEMS_PER_CONT: 12,

    renderDocument(data, container) {
        if (!container) return;

        container.className = `document-paper template-${data.template || 'modern'}`;
        container.setAttribute('data-accent', data.accentColor || '#4f46e5');
        container.style.setProperty('--accent-color', data.accentColor || '#4f46e5');

        const lang = data.language || 'es';
        const L = (key) => I18n.get(lang, key);
        const sym = data.currencySymbol || '$';
        const formatMoney = (amount) => {
            const val = parseFloat(amount) || 0;
            const isClp = !data.currency || data.currency === 'CLP' || data.currency.includes('CLP') || sym === '$';
            const digits = isClp ? 0 : 2;
            return `${sym} ${val.toLocaleString('es-CL', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
        };
        const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            const p = dateStr.split('-');
            return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr;
        };

        let statusBg = '#64748b', statusColor = '#ffffff';
        if (data.status === 'Pendiente') statusBg = '#f59e0b';
        else if (data.status === 'Aprobada') statusBg = '#0ea5e9';
        else if (data.status === 'Pagada') statusBg = '#10b981';

        const docTypeDisplay = I18n.getDocType(lang, data.docType);
        const allItems = (data.items || []).filter(i => i.description || i.quantity > 0);
        const pages = this._splitItemsIntoPages(allItems);
        const totalPages = pages.length;

        // Watermark HTML: If Free user, force mandatory prominent Watermark "VERSIÓN GRATUITA - EMITIA PRO"
        const isPro = typeof AuthSubscription !== 'undefined' && AuthSubscription.userPlan ? AuthSubscription.userPlan.isPro : false;
        let effectiveWatermark = data.watermark;
        if (!isPro) {
            effectiveWatermark = 'VERSIÓN GRATUITA - EMITIA PRO';
        }

        const watermarkHtml = effectiveWatermark
            ? `<div class="doc-watermark ${!isPro ? 'doc-watermark--free' : ''}">${this.escapeHtml(effectiveWatermark)}</div>`
            : '';

        let fullHtml = '';
        pages.forEach((pageItems, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === totalPages - 1;
            const pageNum = idx + 1;

            let pageHtml = `<div class="doc-page" data-page="${pageNum}">`;
            pageHtml += watermarkHtml;

            if (isFirst) {
                pageHtml += this._buildFullHeader(data, statusBg, statusColor, formatDate, docTypeDisplay, L);
            } else {
                pageHtml += this._buildContinuationHeader(data, pageNum, totalPages, docTypeDisplay, L);
            }

            pageHtml += this._buildItemsTable(pageItems, formatMoney, isFirst, isLast, totalPages, L);

            if (isLast) {
                pageHtml += this._buildSummaryAndFooter(data, formatMoney, L);
            } else {
                pageHtml += `
                <div class="doc-page-continues">
                    <span>${L('continuesOn')} ${pageNum + 1} ${L('of')} ${totalPages}</span>
                    <span class="doc-page-num-right">${L('page')} ${pageNum} / ${totalPages}</span>
                </div>`;
            }

            pageHtml += '</div>';
            fullHtml += pageHtml;
        });

        container.innerHTML = fullHtml;

        if (data.qrUrl) {
            setTimeout(() => {
                const qrEl = container.querySelector('#doc-qr-container');
                if (qrEl && typeof QRCode !== 'undefined') {
                    qrEl.innerHTML = '';
                    new QRCode(qrEl, { text: data.qrUrl, width: 90, height: 90, colorDark: '#1e293b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
                }
            }, 50);
        }
    },

    _splitItemsIntoPages(items) {
        if (items.length === 0) return [[]];
        if (items.length <= this.ITEMS_PAGE_1) return [items];
        const pages = [];
        pages.push(items.slice(0, this.ITEMS_PAGE_1));
        let remaining = items.slice(this.ITEMS_PAGE_1);
        while (remaining.length > 0) {
            pages.push(remaining.splice(0, this.ITEMS_PER_CONT));
        }
        return pages;
    },

    _buildFullHeader(data, statusBg, statusColor, formatDate, docTypeDisplay, L) {
        return `
        <div class="doc-header-grid">
            <div class="doc-emitter-info">
                ${data.emitter.logo
                    ? `<img src="${data.emitter.logo}" class="doc-emitter-logo" alt="Logo">`
                    : `<div class="doc-emitter-initials">${this.getInitials(data.emitter.name)}</div>`}
                <h2 class="doc-emitter-name">${this.escapeHtml(data.emitter.name || 'Mi Empresa')}</h2>
                ${data.emitter.taxId ? `<div class="doc-emitter-sub"><strong>${L('taxId')}</strong> ${this.escapeHtml(data.emitter.taxId)}</div>` : ''}
                ${data.emitter.email ? `<div class="doc-emitter-sub"><i class="fa-regular fa-envelope"></i> ${this.escapeHtml(data.emitter.email)}</div>` : ''}
                ${data.emitter.phone ? `<div class="doc-emitter-sub"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(data.emitter.phone)}</div>` : ''}
                ${data.emitter.address ? `<div class="doc-emitter-sub"><i class="fa-solid fa-location-dot"></i> ${this.escapeHtml(data.emitter.address)}</div>` : ''}
            </div>
            <div class="doc-type-badge">
                <div class="doc-type-title">${docTypeDisplay}</div>
                <div class="doc-number">N\u00b0 ${this.escapeHtml(data.number)}</div>
                <div class="doc-status-tag" style="background-color:${statusBg};color:${statusColor};">${data.status}</div>
            </div>
        </div>
        <div class="doc-meta-dates">
            <div class="doc-meta-item">${L('issueDate')}: <span>${formatDate(data.date)}</span></div>
            <div class="doc-meta-item">${L('dueDate')}: <span>${formatDate(data.dueDate)}</span></div>
            <div class="doc-meta-item">${L('currency')}: <span>${data.currency}</span></div>
        </div>
        <div class="doc-parties-grid">
            <div>
                <div class="party-title">${L('billedTo')}</div>
                <div class="party-name">${this.escapeHtml(data.client.name || 'Nombre del Cliente')}</div>
                ${data.client.taxId ? `<div class="party-detail"><strong>${L('taxId')}</strong> ${this.escapeHtml(data.client.taxId)}</div>` : ''}
                ${data.client.email ? `<div class="party-detail"><i class="fa-regular fa-envelope"></i> ${this.escapeHtml(data.client.email)}</div>` : ''}
                ${data.client.phone ? `<div class="party-detail"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(data.client.phone)}</div>` : ''}
                ${data.client.address ? `<div class="party-detail"><i class="fa-solid fa-location-dot"></i> ${this.escapeHtml(data.client.address)}</div>` : ''}
            </div>
            <div>
                <div class="party-title">${L('issuedBy')}</div>
                <div class="party-name">${this.escapeHtml(data.emitter.name || 'Emisor')}</div>
                <div class="party-detail">${this.escapeHtml(data.emitter.email || '')}</div>
            </div>
        </div>`;
    },

    _buildContinuationHeader(data, pageNum, totalPages, docTypeDisplay, L) {
        return `
        <div class="doc-continuation-header">
            <div class="doc-continuation-left">
                ${data.emitter.logo
                    ? `<img src="${data.emitter.logo}" class="doc-cont-logo" alt="Logo">`
                    : `<div class="doc-emitter-initials doc-emitter-initials--sm">${this.getInitials(data.emitter.name)}</div>`}
                <div>
                    <div class="doc-cont-emitter">${this.escapeHtml(data.emitter.name || 'Emisor')}</div>
                    <div class="doc-cont-client">${L('client')}: ${this.escapeHtml(data.client.name || '\u2014')}</div>
                </div>
            </div>
            <div class="doc-continuation-right">
                <div class="doc-type-title doc-type-title--sm">${docTypeDisplay}</div>
                <div class="doc-number">N\u00b0 ${this.escapeHtml(data.number)}</div>
                <div class="doc-cont-page">${L('page')} ${pageNum} ${L('of')} ${totalPages}</div>
            </div>
        </div>`;
    },

    _buildItemsTable(items, formatMoney, isFirst, isLast, totalPages, L) {
        let rowsHtml = '';
        if (items.length > 0) {
            rowsHtml = items.map(item => {
                const qty = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.price) || 0;
                const total = qty * price;
                const imgHtml = item.image ? `<img src="${item.image}" style="width:26px; height:26px; object-fit:cover; border-radius:4px; margin-right:8px; vertical-align:middle; border:1px solid #cbd5e1; flex-shrink:0;">` : '';
                return `<tr>
                    <td>
                        <div style="display:flex; align-items:center;">
                            ${imgHtml}
                            <span><strong>${this.escapeHtml(item.description || 'Concepto')}</strong></span>
                        </div>
                    </td>
                    <td class="text-center">${qty}</td>
                    <td class="text-right">${formatMoney(price)}</td>
                    <td class="text-right"><strong>${formatMoney(total)}</strong></td>
                </tr>`;
            }).join('');
        } else {
            rowsHtml = `<tr><td colspan="4" class="text-center" style="color:#94a3b8;padding:24px;"><em>${L('noItems')}</em></td></tr>`;
        }

        const tableClass = (!isLast && totalPages > 1) ? 'doc-table doc-table--continues' : 'doc-table';
        return `
        <table class="${tableClass}">
            <thead><tr>
                <th style="width:50%;">${L('description')}</th>
                <th class="text-center" style="width:12%;">${L('quantity')}</th>
                <th class="text-right" style="width:18%;">${L('unitPrice')}</th>
                <th class="text-right" style="width:20%;">${L('total')}</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
        </table>`;
    },

    _buildSummaryAndFooter(data, formatMoney, L) {
        const t = data.totals;
        const taxLabelText = t.taxLabel || `${L('tax')} (${data.taxRate}%):`;
        const taxDisplaySign = t.isRetention ? '-' : '';
        const taxColorStyle = t.isRetention ? 'style="color:#ef4444;"' : '';

        const attachmentsHtml = (data.attachments && data.attachments.length > 0) ? `
            <div class="note-box" style="border-left-color:#0284c7; margin-top:8px;">
                <div class="note-box-title"><i class="fa-solid fa-paperclip"></i> Anexos / Documentos Adjuntos:</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
                    ${data.attachments.map(att => `<span style="display:inline-flex; align-items:center; gap:4px; background:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:11px; color:#334155; border:1px solid #cbd5e1;"><i class="fa-solid fa-file"></i> ${this.escapeHtml(att.name)}</span>`).join('')}
                </div>
            </div>
        ` : '';

        return `
        <div class="doc-summary-grid">
            <div class="doc-notes-block">
                ${data.showBankTerms !== false && data.bankDetails ? `
                    <div class="note-box">
                        <div class="note-box-title"><i class="fa-solid fa-building-columns"></i> ${L('paymentData')}</div>
                        <div style="white-space:pre-line;">${this.escapeHtml(data.bankDetails)}</div>
                        ${data.qrUrl ? `<div class="qr-payment-wrapper"><div class="qr-label"><i class="fa-solid fa-qrcode"></i> ${L('scanToPay')}</div><div id="doc-qr-container" class="doc-qr-box"></div></div>` : ''}
                    </div>
                ` : (data.showBankTerms !== false && data.qrUrl ? `
                    <div class="note-box">
                        <div class="note-box-title"><i class="fa-solid fa-qrcode"></i> QR:</div>
                        <div class="qr-payment-wrapper"><div class="qr-label">${L('scanToPay')}</div><div id="doc-qr-container" class="doc-qr-box"></div></div>
                    </div>
                ` : '')}
                ${data.showBankTerms !== false && data.terms ? `<div class="note-box"><div class="note-box-title"><i class="fa-solid fa-info-circle"></i> ${L('conditions')}</div><div style="white-space:pre-line;">${this.escapeHtml(data.terms)}</div></div>` : ''}
                ${data.showBankTerms !== false && data.customNotes ? `<div class="note-box" style="border-left-color:var(--success-color);"><div style="font-weight:600;color:#1e293b;">${this.escapeHtml(data.customNotes)}</div></div>` : ''}
                ${attachmentsHtml}
            </div>
            <div>
                <table class="doc-totals-table">
                    <tr><td class="label">${L('subtotal')}</td><td class="val">${formatMoney(t.subtotal)}</td></tr>
                    ${t.discountAmount > 0 ? `<tr><td class="label">${L('discount')} (${data.discountType === 'percent' ? data.discountVal + '%' : 'Fijo'}):</td><td class="val" style="color:#ef4444;">-${formatMoney(t.discountAmount)}</td></tr>` : ''}
                    ${data.taxRate > 0 || t.taxAmount > 0 ? `<tr><td class="label">${this.escapeHtml(taxLabelText)}</td><td class="val" ${taxColorStyle}>${taxDisplaySign}${formatMoney(t.taxAmount)}</td></tr>` : ''}
                    ${t.shippingFee > 0 ? `<tr><td class="label">${L('shipping')}</td><td class="val">${formatMoney(t.shippingFee)}</td></tr>` : ''}
                    <tr class="grand-total"><td class="label" style="color:var(--accent-color);">${L('grandTotal')}</td><td class="val">${formatMoney(t.grandTotal)}</td></tr>
                </table>
                ${data.showAmountWords !== false ? `<div class="doc-amount-words"><i class="fa-solid fa-file-invoice-dollar"></i> ${this.numberToWordsSpanish(t.grandTotal, data.currency)}</div>` : ''}
            </div>
        </div>
        <div class="doc-footer">
            <div class="doc-footer-brand">
                <div class="doc-footer-logo-text">${this.escapeHtml(data.emitter.name || 'Emitia Pro')}</div>
                ${data.emitter.email ? `<div class="doc-footer-contact">${this.escapeHtml(data.emitter.email)}</div>` : ''}
                ${data.emitter.phone ? `<div class="doc-footer-contact">${this.escapeHtml(data.emitter.phone)}</div>` : ''}
                <div class="doc-footer-generated">${L('generatedWith')}</div>
            </div>
            ${data.showSignature !== false ? `
                <div class="doc-signature-block">
                    ${data.signature ? `<div class="doc-signature-img-wrap"><img src="${data.signature}" class="doc-signature-img" alt="Firma"></div>` : '<div class="doc-signature-blank"></div>'}
                    <div class="doc-signature-line"></div>
                    <div class="doc-signature-name">${data.signerName ? this.escapeHtml(data.signerName) : L('signature')}</div>
                </div>
            ` : ''}
        </div>`;
    },

    getInitials(name) {
        if (!name) return '?';
        const words = name.trim().split(/\s+/);
        return words.length === 1 ? words[0].substring(0, 2).toUpperCase() : (words[0][0] + words[1][0]).toUpperCase();
    },

    numberToWordsSpanish(num, currency = 'USD') {
        if (num === null || num === undefined || isNaN(num)) return '';
        const units = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
        const tens = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
        const teens = ['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
        const hundreds = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
        
        const convertGroup = (n) => {
            let out = '';
            if (n === 100) return 'CIEN';
            if (n > 100) { out += hundreds[Math.floor(n / 100)] + ' '; n %= 100; }
            if (n >= 10 && n <= 19) out += teens[n - 10] + ' ';
            else if (n >= 20 && n <= 29) { out += (n === 20 ? 'VEINTE ' : 'VEINTI' + units[n - 20] + ' '); }
            else if (n >= 30) { out += tens[Math.floor(n / 10)]; if (n % 10 !== 0) out += ' Y ' + units[n % 10]; out += ' '; }
            else if (n > 0) out += units[n] + ' ';
            return out;
        };

        let intPart = Math.floor(Math.abs(num));
        if (intPart === 0) {
            let isClp = !currency || currency === 'CLP' || currency.includes('CLP');
            let currencyText = isClp ? 'PESOS CHILENOS (CLP)' : currency;
            return `SON: CERO ${currencyText}`;
        }

        let wordsText = '';
        if (intPart >= 1000000) {
            let millions = Math.floor(intPart / 1000000);
            intPart %= 1000000;
            wordsText += (millions === 1 ? 'UN MILLÓN ' : convertGroup(millions) + 'MILLONES ');
        }
        if (intPart >= 1000) {
            let thousands = Math.floor(intPart / 1000);
            intPart %= 1000;
            wordsText += (thousands === 1 ? 'MIL ' : convertGroup(thousands) + 'MIL ');
        }
        if (intPart > 0) {
            wordsText += convertGroup(intPart);
        }

        const cents = Math.round((Math.abs(num) - Math.floor(Math.abs(num))) * 100);
        const centsStr = (cents < 10 ? '0' : '') + cents;
        const isClp = !currency || currency === 'CLP' || currency.includes('CLP');
        const currencyText = isClp ? 'PESOS CHILENOS (CLP)' : currency;
        const centsText = (!isClp && cents > 0) ? ` CON ${centsStr}/100` : '';
        return `SON: ${wordsText.trim()} ${centsText} ${currencyText}`.replace(/\s+/g, ' ');
    },

    numeroALetras(num, currency = 'USD') {
        return this.numberToWordsSpanish(num, currency);
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
};
