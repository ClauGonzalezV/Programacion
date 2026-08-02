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
    }
};
