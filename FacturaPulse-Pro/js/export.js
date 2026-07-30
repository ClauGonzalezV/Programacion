/* ==========================================================================
   EXPORT MODULE - PDF GENERATION, PRINT & BACKUP
   ========================================================================== */

const ExportModule = {
    exportToPDF(docData) {
        if (typeof AuthSubscription !== 'undefined' && !AuthSubscription.userPlan.isPro) {
            if (typeof showToast === 'function') {
                showToast('🔒 La descarga a PDF es exclusiva del PLAN PRO. ¡Suscríbete para descargar tus documentos!', 'error');
            }
            if (AuthSubscription.showPricingModal) AuthSubscription.showPricingModal();
            return;
        }

        const element = document.getElementById('document-paper');
        if (!element) return;

        const filename = `${docData.docType}_${docData.number || '001'}_${docData.client.name ? docData.client.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Cliente'}.pdf`;

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
        if (typeof AuthSubscription !== 'undefined' && !AuthSubscription.userPlan.isPro) {
            if (typeof showToast === 'function') {
                showToast('🔒 La impresión de documentos es exclusiva del PLAN PRO. ¡Suscríbete para imprimir!', 'error');
            }
            if (AuthSubscription.showPricingModal) AuthSubscription.showPricingModal();
            return;
        }
        window.print();
    }
};
