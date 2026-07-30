/* ==========================================================================
   DASHBOARD MODULE - STATISTICS, CHARTS & ANALYTICS
   Uses native Canvas API for charts (no external libraries)
   ========================================================================== */

const DashboardModule = {
    render() {
        const history = StorageManager.getHistory();
        this.renderStatCards(history);
        this.renderRevenueChart(history);
        this.renderStatusChart(history);
        this.renderTopClients(history);
        this.renderDueSoon(history);
    },

    renderStatCards(history) {
        const container = document.getElementById('dashboard-stats-row');
        if (!container) return;

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        let pending = 0;
        let paid = 0;

        history.forEach(h => {
            const gt = (h.totals && h.totals.grandTotal) || 0;
            totalRevenue += gt;

            if (h.date) {
                const d = new Date(h.date);
                if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
                    thisMonthRevenue += gt;
                }
            }

            if (h.status === 'Pagada') paid++;
            else if (h.status === 'Pendiente') pending++;
        });

        container.innerHTML = `
            <div class="stat-card stat-card--primary">
                <div class="stat-icon"><i class="fa-solid fa-coins"></i></div>
                <div class="stat-info">
                    <div class="stat-value">$ ${totalRevenue.toLocaleString('es-CL', {minimumFractionDigits: 0})}</div>
                    <div class="stat-label">Total Facturado</div>
                </div>
            </div>
            <div class="stat-card stat-card--accent">
                <div class="stat-icon"><i class="fa-solid fa-calendar-check"></i></div>
                <div class="stat-info">
                    <div class="stat-value">$ ${thisMonthRevenue.toLocaleString('es-CL', {minimumFractionDigits: 0})}</div>
                    <div class="stat-label">Este Mes</div>
                </div>
            </div>
            <div class="stat-card stat-card--warning">
                <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
                <div class="stat-info">
                    <div class="stat-value">${pending}</div>
                    <div class="stat-label">Pendientes</div>
                </div>
            </div>
            <div class="stat-card stat-card--success">
                <div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
                <div class="stat-info">
                    <div class="stat-value">${paid}</div>
                    <div class="stat-label">Pagadas</div>
                </div>
            </div>
            <div class="stat-card stat-card--info">
                <div class="stat-icon"><i class="fa-solid fa-file-lines"></i></div>
                <div class="stat-info">
                    <div class="stat-value">${history.length}</div>
                    <div class="stat-label">Total Documentos</div>
                </div>
            </div>
        `;
    },

    renderRevenueChart(history) {
        const canvas = document.getElementById('chart-revenue');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Last 6 months revenue
        const now = new Date();
        const months = [];
        const values = [];
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(monthNames[d.getMonth()] + ' ' + d.getFullYear());
            const m = d.getMonth();
            const y = d.getFullYear();
            let sum = 0;
            history.forEach(h => {
                if (h.date) {
                    const hd = new Date(h.date);
                    if (hd.getMonth() === m && hd.getFullYear() === y) {
                        sum += (h.totals && h.totals.grandTotal) || 0;
                    }
                }
            });
            values.push(sum);
        }

        const w = canvas.width;
        const h = canvas.height;
        const padding = { top: 30, right: 20, bottom: 40, left: 70 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;
        const maxVal = Math.max(...values, 1);
        const barW = chartW / months.length * 0.6;
        const gap = chartW / months.length;

        ctx.clearRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y2 = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y2);
            ctx.lineTo(w - padding.right, y2);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            const labelVal = Math.round(maxVal - (maxVal / 4) * i);
            ctx.fillText('$' + labelVal.toLocaleString(), padding.left - 8, y2 + 4);
        }

        // Bars
        values.forEach((val, idx) => {
            const x = padding.left + gap * idx + (gap - barW) / 2;
            const barH = (val / maxVal) * chartH;
            const y = padding.top + chartH - barH;

            const grad = ctx.createLinearGradient(x, y, x, y + barH);
            grad.addColorStop(0, '#818cf8');
            grad.addColorStop(1, '#4f46e5');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
            ctx.fill();

            // Value on top
            if (val > 0) {
                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('$' + Math.round(val).toLocaleString(), x + barW / 2, y - 8);
            }

            // Month label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(months[idx], x + barW / 2, h - 10);
        });
    },

    renderStatusChart(history) {
        const canvas = document.getElementById('chart-status');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const counts = { Borrador: 0, Pendiente: 0, Aprobada: 0, Pagada: 0 };
        history.forEach(h => { if (counts[h.status] !== undefined) counts[h.status]++; });

        const colors = { Borrador: '#64748b', Pendiente: '#f59e0b', Aprobada: '#0ea5e9', Pagada: '#10b981' };
        const data = Object.entries(counts).filter(([, v]) => v > 0);
        const total = data.reduce((s, [, v]) => s + v, 0) || 1;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2 - 10;
        const radius = Math.min(cx, cy) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let angle = -Math.PI / 2;
        data.forEach(([label, val]) => {
            const sliceAngle = (val / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[label] || '#64748b';
            ctx.fill();
            angle += sliceAngle;
        });

        // Center hole (donut)
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        // Center text
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 24px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(total, cx, cy + 8);
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('documentos', cx, cy + 24);

        // Legend
        let ly = canvas.height - 20;
        let lx = 10;
        data.forEach(([label, val]) => {
            ctx.fillStyle = colors[label];
            ctx.fillRect(lx, ly - 8, 10, 10);
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '11px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${label} (${val})`, lx + 14, ly);
            lx += ctx.measureText(`${label} (${val})`).width + 28;
        });
    },

    renderTopClients(history) {
        const container = document.getElementById('dashboard-top-clients');
        if (!container) return;

        const clientMap = {};
        history.forEach(h => {
            const name = (h.client && h.client.name) || 'Sin cliente';
            const gt = (h.totals && h.totals.grandTotal) || 0;
            clientMap[name] = (clientMap[name] || 0) + gt;
        });

        const sorted = Object.entries(clientMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

        if (sorted.length === 0) {
            container.innerHTML = '<div style="color:var(--text-muted);padding:20px;text-align:center;">Sin datos aún</div>';
            return;
        }

        const maxAmount = sorted[0][1] || 1;
        container.innerHTML = sorted.map(([name, amount], i) => {
            const pct = (amount / maxAmount * 100).toFixed(0);
            const medals = ['🥇', '🥈', '🥉', '4°', '5°'];
            return `
                <div class="top-client-row">
                    <span class="top-client-rank">${medals[i]}</span>
                    <div class="top-client-info">
                        <div class="top-client-name">${name}</div>
                        <div class="top-client-bar"><div class="top-client-bar-fill" style="width:${pct}%"></div></div>
                    </div>
                    <span class="top-client-amount">$ ${amount.toLocaleString('es-CL', {minimumFractionDigits: 0})}</span>
                </div>`;
        }).join('');
    },

    renderDueSoon(history) {
        const container = document.getElementById('dashboard-due-soon');
        if (!container) return;

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const soon = history.filter(h => {
            if (h.status === 'Pagada') return false;
            if (!h.dueDate) return false;
            const dd = new Date(h.dueDate);
            const diff = (dd - now) / (1000 * 60 * 60 * 24);
            return diff <= 7;
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 6);

        if (soon.length === 0) {
            container.innerHTML = '<div style="color:var(--text-muted);padding:20px;text-align:center;">No hay documentos por vencer</div>';
            return;
        }

        container.innerHTML = soon.map(h => {
            const dd = new Date(h.dueDate);
            const diff = Math.ceil((dd - now) / (1000 * 60 * 60 * 24));
            let badgeClass = 'badge-due-ok';
            let badgeText = `${diff} días`;
            if (diff < 0) { badgeClass = 'badge-due-overdue'; badgeText = 'VENCIDA'; }
            else if (diff <= 3) { badgeClass = 'badge-due-warn'; badgeText = diff === 0 ? 'HOY' : `${diff}d`; }

            return `
                <div class="due-soon-row">
                    <div><strong>${h.number}</strong> — ${(h.client && h.client.name) || 'Sin cliente'}</div>
                    <span class="due-badge ${badgeClass}">${badgeText}</span>
                </div>`;
        }).join('');
    }
};
