let allDiagnoses = [];
let allPatients = [];
let allDoctors = [];

document.addEventListener('DOMContentLoaded', async () => {
    auth.requireAuth();
    layout.init();

    await loadData();

    const searchInput = document.getElementById('search-input');
    const filterSeverity = document.getElementById('filter-severity');
    const filterCategory = document.getElementById('filter-category');

    if (searchInput) searchInput.addEventListener('input', renderDiagnoses);
    if (filterSeverity) filterSeverity.addEventListener('change', renderDiagnoses);
    if (filterCategory) filterCategory.addEventListener('change', renderDiagnoses);
});

async function loadData() {
    try {
        [allDiagnoses, allPatients, allDoctors] = await Promise.all([
            api.get('/diagnoses'),
            api.get('/patients').catch(() => []),
            api.get('/doctors').catch(() => [])
        ]);
        const filterCategory = document.getElementById('filter-category');
        try {
            const cats = await api.get('/diagnosis-categories').catch(() => []);
            const categoryNames = new Set();
            if (Array.isArray(cats)) {
                cats.forEach(c => { if (c && c.name) categoryNames.add(c.name); });
            }
            allDiagnoses.forEach(d => { if (d.category) categoryNames.add(d.category); });
            const sortedCategories = Array.from(categoryNames).sort((a, b) => a.localeCompare(b));
            if (filterCategory) {
                filterCategory.innerHTML = '<option value="">All Categories</option>' + sortedCategories.map(name => `<option value="${name}">${name}</option>`).join('');
            }
        } catch (e) {
            console.warn('Failed to load diagnosis categories', e);
        }
        renderDiagnoses();
    } catch (err) {
        layout.showToast('Failed to load data', 'error');
    }
}

function renderDiagnoses() {
    const tbody = document.querySelector('#diagnoses-table tbody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const severityFilter = document.getElementById('filter-severity')?.value || '';
    const categoryFilter = document.getElementById('filter-category')?.value || '';

    const filtered = allDiagnoses.filter(diag => {
        const pat = allPatients.find(p => p.id === diag.patientId);
        const patName = pat ? `${pat.firstName} ${pat.lastName}`.toLowerCase() : '';
        const doc = allDoctors.find(d => d.id === diag.assignedDoctorId);
        const docName = doc ? doc.fullName.toLowerCase() : '';

        const matchesSearch = diag.icdCode.toLowerCase().includes(searchTerm) || 
                              diag.description.toLowerCase().includes(searchTerm) || 
                              patName.includes(searchTerm) ||
                              docName.includes(searchTerm);
        
        const matchesSeverity = severityFilter ? diag.severity === severityFilter : true;
        const matchesCategory = categoryFilter ? (diag.category || '') === categoryFilter : true;

        return matchesSearch && matchesSeverity && matchesCategory;
    });

    const isAdmin = auth.hasRole(['administrator']);

    tbody.innerHTML = filtered.map(diag => {
            const pat = allPatients.find(p => p.id === diag.patientId);
        const patName = pat ? `${pat.firstName} ${pat.lastName}` : diag.patientId;
        const doc = allDoctors.find(d => d.id === diag.assignedDoctorId);
        const docName = doc ? doc.fullName : '-';
        return `
        <tr>
            <td style="color:var(--teal); font-weight:600;">${diag.icdCode}</td>
            <td>${diag.category || '-'}</td>
            <td>${patName}</td>
            <td>${docName}</td>
            <td>
                <span class="badge ${diag.severity === 'Critical' ? 'badge-critical' : diag.severity === 'High' ? 'badge-danger' : diag.severity === 'Medium' ? 'badge-warning' : 'badge-success'}">${diag.severity}</span>
            </td>
            <td>${layout.formatDate(diag.diagnosisDate)}</td>
            <td>
                <div class="table-actions">
                    <a href="diagnosis-detail.html?id=${diag.id}" class="btn-secondary" style="padding: 6px 14px; font-size: 12px;">View</a>
                    <a href="diagnosis-form.html?id=${diag.id}" class="btn-icon" title="Edit"><i class="fas fa-edit"></i></a>
                    ${isAdmin ? `
                    <button class="btn-icon" style="color:var(--danger);" onclick="deleteDiagnosis('${diag.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `}).join('');

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color:var(--muted);">No diagnosis records found</td></tr>`;
    }
}

async function deleteDiagnosis(id) {
    if (confirm('Are you sure you want to delete this diagnosis record?')) {
        try {
            await api.delete(`/diagnoses/${id}`);
            layout.showToast('Diagnosis deleted successfully');
            await loadData();
        } catch (err) {
            layout.showToast(err.message, 'error');
        }
    }
}
