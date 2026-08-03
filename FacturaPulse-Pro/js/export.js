/* ==========================================================================
   EXPORT MODULE - PDF GENERATION, PRINT & BACKUP
   ========================================================================== */

const ExportModule = {
    exportToPDF(docData) {
        const element = document.getElementById('document-paper');
        if (!element) return;

        const filename = `${docData.docType}_${docData.number || '001'}_${docData.client && docData.client.name ? docData.client.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Cliente'}.pdf`;

        if (typeof html2pdf !== 'undefined') {
            if (typeof showToast === 'function') {
                showToast('Generando archivo PDF...', 'info');
            }

            const opt = {
                margin: 0,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                if (typeof showToast === 'function') {
                    showToast('PDF descargado con éxito', 'success');
                }
            }).catch(err => {
                console.error('PDF error:', err);
                this.printDocument();
            });
        } else {
            this.printDocument();
        }
    },

    printDocument() {
        window.print();
    },

    exportAccountingReportPDF() {
        if (typeof AuthSubscription !== 'undefined' && (!AuthSubscription.userPlan || !AuthSubscription.userPlan.isPro)) {
            if (typeof showToast === 'function') {
                showToast('🔒 El Reporte Contable Mensual es exclusivo del PLAN PRO. ¡Suscríbete para desbloquearlo!', 'error');
            }
            if (typeof AuthSubscription.showPricingModal === 'function') {
                AuthSubscription.showPricingModal();
            }
            return;
        }

        const history = typeof StorageManager !== 'undefined' ? StorageManager.getHistory() : [];
        if (history.length === 0) {
            if (typeof showToast === 'function') showToast('⚠️ No hay facturas ni cotizaciones guardadas para generar el reporte.', 'error');
            return;
        }

        const now = new Date();
        const monthName = now.toLocaleString('es-CL', { month: 'long' }).toUpperCase();
        const year = now.getFullYear();

        let totalSubtotal = 0;
        let totalIva = 0;
        let totalRetenciones = 0;
        let totalExento = 0;
        let totalGeneral = 0;

        const tableRowsHtml = history.map((doc, idx) => {
            const grandTotal = doc.totals.grandTotal || 0;
            const subtotal = doc.totals.subtotalAfterDiscount || doc.totals.subtotal || 0;
            const isRetention = doc.taxPreset === 'ret_1375';
            const isExempt = doc.taxPreset === 'exempt';
            const taxAmount = doc.totals.taxAmount || 0;

            if (isRetention) {
                totalRetenciones += taxAmount;
                totalSubtotal += subtotal;
            } else if (isExempt) {
                totalExento += subtotal;
            } else {
                totalIva += taxAmount;
                totalSubtotal += subtotal;
            }
            totalGeneral += grandTotal;

            return `
                <tr style="border-bottom: 1px solid #e2e8f0; font-size: 0.85rem;">
                    <td style="padding: 8px;">${idx + 1}</td>
                    <td style="padding: 8px;"><strong>${doc.number}</strong></td>
                    <td style="padding: 8px;">${doc.docType}</td>
                    <td style="padding: 8px;">${doc.date || 'N/A'}</td>
                    <td style="padding: 8px;">${doc.client.name || 'Sin cliente'}</td>
                    <td style="padding: 8px; text-align: right;">$ ${subtotal.toLocaleString('es-CL')}</td>
                    <td style="padding: 8px; text-align: right;">$ ${(!isRetention && !isExempt) ? taxAmount.toLocaleString('es-CL') : '0'}</td>
                    <td style="padding: 8px; text-align: right;">$ ${isRetention ? taxAmount.toLocaleString('es-CL') : '0'}</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">$ ${grandTotal.toLocaleString('es-CL')}</td>
                </tr>
            `;
        }).join('');

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            if (typeof showToast === 'function') showToast('⚠️ Permite las ventanas emergentes para generar el reporte contable.', 'error');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte Contable Mensual - ${monthName} ${year}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 20px; padding: 0; }
                    .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; }
                    .report-title { font-size: 1.5rem; font-weight: 800; color: #4f46e5; margin: 0; }
                    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                    .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; text-align: center; }
                    .kpi-card span { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
                    .kpi-card h3 { font-size: 1.2rem; margin: 4px 0 0 0; color: #0f172a; }
                    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                    th { background: #4f46e5; color: #ffffff; font-size: 0.8rem; text-align: left; padding: 10px 8px; text-transform: uppercase; }
                    th.num, td.num { text-align: right; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <div>
                        <h1 class="report-title">📊 INFORME CONTABLE MENSUAL DE VENTAS</h1>
                        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.9rem;">Período: ${monthName} ${year} | Emitia Pro Software</p>
                    </div>
                    <div style="text-align: right; font-size: 0.85rem; color: #64748b;">
                        <strong>Fecha Emisión:</strong> ${new Date().toLocaleDateString('es-CL')}<br>
                        <strong>Total Documentos:</strong> ${history.length}
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <span>Ventas Netas Subtotal</span>
                        <h3>$ ${totalSubtotal.toLocaleString('es-CL')}</h3>
                    </div>
                    <div class="kpi-card">
                        <span>IVA Débito Fiscal (19%)</span>
                        <h3 style="color: #0ea5e9;">$ ${totalIva.toLocaleString('es-CL')}</h3>
                    </div>
                    <div class="kpi-card">
                        <span>Retención Honorarios</span>
                        <h3 style="color: #f59e0b;">$ ${totalRetenciones.toLocaleString('es-CL')}</h3>
                    </div>
                    <div class="kpi-card">
                        <span>Total Facturado</span>
                        <h3 style="color: #10b981;">$ ${totalGeneral.toLocaleString('es-CL')}</h3>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Folio</th>
                            <th>Tipo</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th class="num">Neto ($)</th>
                            <th class="num">IVA ($)</th>
                            <th class="num">Ret. ($)</th>
                            <th class="num">Total ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};
