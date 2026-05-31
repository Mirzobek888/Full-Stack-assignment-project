let allDoctors = [];

document.addEventListener('DOMContentLoaded', async () => {
    auth.requireAuth();
    layout.init();

    await loadData();

    document.getElementById('filter-dept').addEventListener('change', (e) => {
        updateDocFilter(e.target.value);
        renderSchedule();
    });

    document.getElementById('filter-doc').addEventListener('change', renderSchedule);
});

async function loadData() {
    try {
        allDoctors = await api.get('/doctors');
        updateDocFilter('');
        renderSchedule();
    } catch (err) {
        layout.showToast('Failed to load schedule data', 'error');
    }
}

function updateDocFilter(dept) {
    const docSelect = document.getElementById('filter-doc');
    const filteredDocs = dept ? allDoctors.filter(d => d.department === dept) : allDoctors;
    
    docSelect.innerHTML = '<option value="">All Doctors</option>' + 
        filteredDocs.map(d => `<option value="${d.id}">${d.fullName}</option>`).join('');
}

function renderSchedule() {
    const deptFilter = document.getElementById('filter-dept').value;
    const docFilter = document.getElementById('filter-doc').value;

    const filteredDocs = allDoctors.filter(doc => {
        const matchesDept = deptFilter ? doc.department === deptFilter : true;
        const matchesDoc = docFilter ? doc.id === docFilter : true;
        return matchesDept && matchesDoc;
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    days.forEach(day => {
        const dayContainer = document.querySelector(`#day-${day} .day-content`);
        if (!dayContainer) return;

        const dayDocs = filteredDocs.filter(d => d.availableDays && d.availableDays.includes(day));

        // Sort by start time conceptually, but strings are HH:mm so string sort works.
        dayDocs.sort((a,b) => a.startTime.localeCompare(b.startTime));

        dayContainer.innerHTML = dayDocs.map(doc => {
            let statusClass = '';
            if(doc.status === 'Busy') statusClass = 'busy';
            if(doc.status === 'Off Duty') statusClass = 'off';

            return `
                <div class="schedule-card ${statusClass}">
                    <div class="sch-doc">${doc.fullName}</div>
                    <div class="sch-time"><i class="far fa-clock"></i> ${doc.startTime} - ${doc.endTime}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <span class="sch-dept">${doc.department}</span>
                        <span style="font-size:11px; color:var(--muted);">Room ${doc.officeRoom || '-'}</span>
                    </div>
                </div>
            `;
        }).join('');

        if (dayDocs.length === 0) {
            dayContainer.innerHTML = `<div style="text-align:center; color:var(--muted); font-size:13px; padding:12px;">No doctors available</div>`;
        }
    });
}
