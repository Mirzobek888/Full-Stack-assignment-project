document.addEventListener('DOMContentLoaded', async () => {
    auth.requireRole(['administrator', 'clinician']);
    layout.init();

    await loadReports();
});

async function loadReports() {
    try {
        const reports = await api.get('/reports');
        const patients = await api.get('/patients').catch(()=>[]);
        const users = await api.get('/users').catch(()=>[]); // Only admin can get users normally, but let's see. If not, just use createdBy string.

        const tbody = document.querySelector('#reports-table tbody');
        if (!tbody) return;

        // Sort by date descending
        reports.sort((a,b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = reports.map(rep => {
            const pat = patients.find(p => p.id === rep.patientId);
            const patName = pat ? `${pat.firstName} ${pat.lastName}` : rep.patientId;

            return `
            <tr>
                <td style="font-weight:600; color:var(--teal);">${rep.name}</td>
                <td>${patName}</td>
                <td>${rep.createdBy}</td>
                <td>${layout.formatDate(rep.date)}</td>
                <td><span class="badge badge-success">${rep.status}</span></td>
                <td>
                    <a href="patient-report.html?id=${rep.patientId}" class="btn-secondary" style="padding:4px 12px; font-size:12px;">View</a>
                </td>
            </tr>
            `;
        }).join('');

        if(reports.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 32px; color:var(--muted);">No reports generated yet</td></tr>`;
        }

    } catch (err) {
        layout.showToast('Failed to load reports', 'error');
    }
}
