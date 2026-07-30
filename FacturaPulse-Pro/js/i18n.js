/* ==========================================================================
   I18N MODULE - MULTI-LANGUAGE DOCUMENT LABELS
   ========================================================================== */

const I18n = {
    es: {
        docTypes: { 'COTIZACIÓN': 'COTIZACIÓN', 'PRESUPUESTO': 'PRESUPUESTO', 'FACTURA': 'FACTURA', 'RECIBO': 'RECIBO DE PAGO', 'NOTA DE CRÉDITO': 'NOTA DE CRÉDITO', 'NOTA DE DÉBITO': 'NOTA DE DÉBITO', 'ORDEN DE COMPRA': 'ORDEN DE COMPRA', 'PROFORMA': 'PROFORMA', 'CONTRATO': 'CONTRATO' },
        issueDate: 'Fecha Emisión',
        dueDate: 'Vencimiento',
        currency: 'Moneda',
        billedTo: 'Facturado A / Cliente:',
        issuedBy: 'Emitido Por:',
        description: 'Descripción',
        quantity: 'Cant.',
        unitPrice: 'Precio Unit.',
        total: 'Total',
        subtotal: 'Subtotal:',
        discount: 'Descuento',
        tax: 'IVA / Impuesto',
        shipping: 'Envío / Gastos:',
        grandTotal: 'TOTAL:',
        paymentData: 'Datos de Pago:',
        scanToPay: 'Escanea para pagar',
        conditions: 'Condiciones:',
        signature: 'Firma y Sello del Emisor',
        page: 'Página',
        of: 'de',
        continuesOn: 'Continúa en la página',
        noItems: 'Sin conceptos agregados.',
        generatedWith: 'Generado con Emitia Pro',
        taxId: 'RUT/NIF:',
        client: 'Cliente',
        amountPrefix: 'SON:'
    },
    en: {
        docTypes: { 'COTIZACIÓN': 'QUOTE', 'PRESUPUESTO': 'ESTIMATE', 'FACTURA': 'INVOICE', 'RECIBO': 'RECEIPT', 'NOTA DE CRÉDITO': 'CREDIT NOTE', 'NOTA DE DÉBITO': 'DEBIT NOTE', 'ORDEN DE COMPRA': 'PURCHASE ORDER', 'PROFORMA': 'PROFORMA', 'CONTRATO': 'CONTRACT' },
        issueDate: 'Issue Date',
        dueDate: 'Due Date',
        currency: 'Currency',
        billedTo: 'Bill To / Client:',
        issuedBy: 'Issued By:',
        description: 'Description',
        quantity: 'Qty.',
        unitPrice: 'Unit Price',
        total: 'Total',
        subtotal: 'Subtotal:',
        discount: 'Discount',
        tax: 'Tax / VAT',
        shipping: 'Shipping / Fees:',
        grandTotal: 'TOTAL:',
        paymentData: 'Payment Details:',
        scanToPay: 'Scan to pay',
        conditions: 'Terms & Conditions:',
        signature: 'Authorized Signature & Stamp',
        page: 'Page',
        of: 'of',
        continuesOn: 'Continues on page',
        noItems: 'No items added.',
        generatedWith: 'Generated with Emitia Pro',
        taxId: 'Tax ID:',
        client: 'Client',
        amountPrefix: 'AMOUNT:'
    },
    pt: {
        docTypes: { 'COTIZACIÓN': 'COTAÇÃO', 'PRESUPUESTO': 'ORÇAMENTO', 'FACTURA': 'FATURA', 'RECIBO': 'RECIBO', 'NOTA DE CRÉDITO': 'NOTA DE CRÉDITO', 'NOTA DE DÉBITO': 'NOTA DE DÉBITO', 'ORDEN DE COMPRA': 'ORDEM DE COMPRA', 'PROFORMA': 'PROFORMA', 'CONTRATO': 'CONTRATO' },
        issueDate: 'Data de Emissão',
        dueDate: 'Vencimento',
        currency: 'Moeda',
        billedTo: 'Faturado Para / Cliente:',
        issuedBy: 'Emitido Por:',
        description: 'Descrição',
        quantity: 'Qtd.',
        unitPrice: 'Preço Unit.',
        total: 'Total',
        subtotal: 'Subtotal:',
        discount: 'Desconto',
        tax: 'IVA / Imposto',
        shipping: 'Envio / Despesas:',
        grandTotal: 'TOTAL:',
        paymentData: 'Dados de Pagamento:',
        scanToPay: 'Escaneie para pagar',
        conditions: 'Condições:',
        signature: 'Assinatura e Carimbo do Emissor',
        page: 'Página',
        of: 'de',
        continuesOn: 'Continua na página',
        noItems: 'Sem itens adicionados.',
        generatedWith: 'Gerado com Emitia Pro',
        taxId: 'NIF/CNPJ:',
        client: 'Cliente',
        amountPrefix: 'SÃO:'
    },

    get(lang, key) {
        const dict = this[lang] || this.es;
        return dict[key] || this.es[key] || key;
    },

    getDocType(lang, rawType) {
        const dict = this[lang] || this.es;
        return (dict.docTypes && dict.docTypes[rawType]) || rawType;
    }
};
