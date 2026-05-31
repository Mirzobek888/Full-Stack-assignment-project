let allDoctors = [];

document.addEventListener('DOMContentLoaded', async () => {
    auth.requireAuth();
    layout.init();

    await loadDoctors();

    const searchInput = document.getElementById('search-input');
    const filterDept = document.getElementById('filter-dept');
    const filterStatus = document.getElementById('filter-status');

    if (searchInput) searchInput.addEventListener('input', renderDoctors);
    if (filterDept) filterDept.addEventListener('change', renderDoctors);
    if (filterStatus) filterStatus.addEventListener('change', renderDoctors);
});

async function loadDoctors() {
    try {
        allDoctors = await api.get('/doctors');
        renderDoctors();
    } catch (err) {
        layout.showToast('Failed to load doctors', 'error');
    }
}

function renderDoctors() {
    const tbody = document.querySelector('#doctors-table tbody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('filter-dept')?.value || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';

    const filtered = allDoctors.filter(doc => {
        const matchesSearch = doc.fullName.toLowerCase().includes(searchTerm) || doc.specialty.toLowerCase().includes(searchTerm) || doc.department.toLowerCase().includes(searchTerm);
        const matchesDept = deptFilter ? doc.department === deptFilter : true;
        const matchesStatus = statusFilter ? doc.status === statusFilter : true;
        return matchesSearch && matchesDept && matchesStatus;
    });

    const isAdmin = auth.hasRole(['administrator']);

    tbody.innerHTML = filtered.map(doc => `
        <tr>
            <td style="display:flex; align-items:center; gap:12px;">
                <div style="width:32px; height:32px; border-radius:50%; background:var(--bg-panel-strong); display:flex; align-items:center; justify-content:center; border:1px solid var(--border-soft);">
                    ${layout.getAvatarInitials(doc.fullName)}
                </div>
                ${doc.fullName}
            </td>
            <td>${doc.specialty}</td>
            <td>${doc.department}</td>
            <td>${doc.phone}</td>
            <td>
                <span class="badge ${doc.status === 'Available' ? 'badge-success' : doc.status === 'Busy' ? 'badge-warning' : 'badge-neutral'}">${doc.status}</span>
            </td>
            <td>
                <div class="table-actions">
                    <a href="doctor-detail.html?id=${doc.id}" class="btn-icon" title="View"><i class="fas fa-eye"></i></a>
                    ${isAdmin ? `
                    <a href="doctor-form.html?id=${doc.id}" class="btn-icon" title="Edit"><i class="fas fa-edit"></i></a>
                    <button class="btn-icon" style="color:var(--danger);" onclick="deleteDoctor('${doc.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 32px; color:var(--muted);">No doctors found</td></tr>`;
    }
}

async function deleteDoctor(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        try {
            await api.delete(`/doctors/${id}`);
            layout.showToast('Doctor deleted successfully');
            await loadDoctors();
        } catch (err) {
            layout.showToast(err.message, 'error');
        }
    }
}
