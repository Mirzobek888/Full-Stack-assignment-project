document.addEventListener('DOMContentLoaded', () => {
    auth.requireAuth();
    layout.init();
    loadReports();
});

async function loadReports() {
    try {
        const reports = await api.get('/reports');
        const patients = await api.get('/patients');
        
        const tbody = document.querySelector('#reports-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        // Sort by date descending
        reports.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Populate table
        tbody.innerHTML = reports.map(rep => {
            const patient = patients.find(p => p.id === rep.patientId);
            const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
            const date = layout.formatDateTime(rep.createdAt);
            const type = rep.type || 'General';
            
            return `
                <tr>
                    <td>${rep.id}</td>
                    <td>${patientName}</td>
                    <td><span class="badge-neutral">${type}</span></td>
                    <td>${date}</td>
                    <td>${rep.createdBy || 'System'}</td>
                    <td>
                        <a href="patient-report.html?id=${rep.patientId}" class="btn-secondary" style="padding:6px 14px; font-size:12px;">View</a>
                    </td>
                </tr>
            `;
        }).join('');

        if(reports.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 32px; color:var(--muted);">No reports generated yet</td></tr>`;
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        layout.showToast('Failed to load reports', 'error');
    }
}
