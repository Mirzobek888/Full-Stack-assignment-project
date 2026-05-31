let allPatients = [];
let allDoctors = [];

document.addEventListener('DOMContentLoaded', async () => {
    auth.requireAuth();
    layout.init();

    await loadData();

    const searchInput = document.getElementById('search-input');
    const filterDept = document.getElementById('filter-dept');
    const filterStatus = document.getElementById('filter-status');

    if (searchInput) searchInput.addEventListener('input', renderPatients);
    if (filterDept) filterDept.addEventListener('change', renderPatients);
    if (filterStatus) filterStatus.addEventListener('change', renderPatients);
});

async function loadData() {
    try {
        [allPatients, allDoctors] = await Promise.all([
            api.get('/patients'),
            api.get('/doctors').catch(() => [])
        ]);
        renderPatients();
    } catch (err) {
        layout.showToast('Failed to load data', 'error');
    }
}

function renderPatients() {
    const tbody = document.querySelector('#patients-table tbody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('filter-dept')?.value || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';

    const filtered = allPatients.filter(pat => {
        const matchesSearch = pat.firstName.toLowerCase().includes(searchTerm) || 
                              pat.lastName.toLowerCase().includes(searchTerm) || 
                              pat.id.toLowerCase().includes(searchTerm) ||
                              pat.phone.includes(searchTerm);
        const matchesDept = deptFilter ? pat.department === deptFilter : true;
        const matchesStatus = statusFilter ? pat.status === statusFilter : true;
        return matchesSearch && matchesDept && matchesStatus;
    });

    const isAdmin = auth.hasRole(['administrator']);
    const canEdit = auth.hasRole(['administrator', 'clinician']);

    tbody.innerHTML = filtered.map(pat => {
        const doc = allDoctors.find(d => d.id === pat.assignedDoctorId);
        const docName = doc ? doc.fullName : '-';

        return `
        <tr>
            <td style="color:var(--teal); font-weight:600;">${pat.id}</td>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:var(--bg-panel-strong); display:flex; align-items:center; justify-content:center; border:1px solid var(--border-soft);">
                        ${layout.getAvatarInitials(pat.firstName + ' ' + pat.lastName)}
                    </div>
                    ${pat.firstName} ${pat.lastName}
                </div>
            </td>
            <td>${layout.calculateAge(pat.dateOfBirth)}</td>
            <td>${pat.gender}</td>
            <td>${docName}</td>
            <td>
                <span class="badge ${pat.status === 'Critical' ? 'badge-critical' : pat.status === 'Monitoring' ? 'badge-warning' : 'badge-success'}">${pat.status}</span>
            </td>
            <td>
                <div class="table-actions">
                    <a href="patient-profile.html?id=${pat.id}" class="btn-icon" title="View Profile"><i class="fas fa-eye"></i></a>
                    ${canEdit ? `
                    <a href="patient-form.html?id=${pat.id}" class="btn-icon" title="Edit"><i class="fas fa-edit"></i></a>
                    ` : ''}
                    ${isAdmin ? `
                    <button class="btn-icon" style="color:var(--danger);" onclick="deletePatient('${pat.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `}).join('');

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color:var(--muted);">No patients found</td></tr>`;
    }
}

async function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            await api.delete(`/patients/${id}`);
            layout.showToast('Patient deleted successfully');
            await loadData();
        } catch (err) {
            layout.showToast(err.message, 'error');
        }
    }
}
