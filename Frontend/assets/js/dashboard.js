document.addEventListener('DOMContentLoaded', async () => {
    auth.requireAuth();
    layout.init();

    const user = auth.getCurrentUser();
    document.getElementById('welcome-name').textContent = user.name.split(' ')[0];

    renderQuickActions(user.role);
    await loadDashboardData(user.role);
});

function renderQuickActions(role) {
    const container = document.getElementById('quick-actions');
    let actions = [];

    if (role === 'administrator') {
        actions = [
            { icon: 'fa-user-md', title: 'Add Doctor', link: 'doctor-form.html' },
            { icon: 'fa-user-plus', title: 'Register Patient', link: 'patient-form.html' },
            { icon: 'fa-notes-medical', title: 'Add Diagnosis', link: 'diagnosis-form.html' },
            { icon: 'fa-file-medical-alt', title: 'Reports', link: 'reports.html' },
            { icon: 'fa-users-cog', title: 'Manage Users', link: 'users.html' }
        ];
    } else if (role === 'clinician') {
        actions = [
            { icon: 'fa-notes-medical', title: 'Add Diagnosis', link: 'diagnosis-form.html' },
            { icon: 'fa-file-medical-alt', title: 'My Patients', link: 'patients.html' },
            { icon: 'fa-calendar-alt', title: 'My Schedule', link: 'schedules.html' }
        ];
    } else if (role === 'receptionist') {
        actions = [
            { icon: 'fa-user-plus', title: 'Register Patient', link: 'patient-form.html' },
            { icon: 'fa-search', title: 'Search Patients', link: 'patients.html' },
            { icon: 'fa-calendar-alt', title: 'View Schedules', link: 'schedules.html' }
        ];
    }

    container.innerHTML = actions.map(action => `
        <a href="${action.link}" class="action-btn">
            <i class="fas ${action.icon}"></i>
            <span>${action.title}</span>
        </a>
    `).join('');
}

async function loadDashboardData(role) {
    try {
        const patients = await api.get('/patients');
        
        let statsHtml = `
            <div class="glass-card stat-card">
                <div class="stat-icon"><i class="fas fa-user-injured"></i></div>
                <div class="stat-info">
                    <h3>${patients.length}</h3>
                    <p>Total Patients</p>
                </div>
            </div>
        `;

        if (role === 'administrator' || role === 'clinician') {
            const doctors = await api.get('/doctors');
            const diagnoses = await api.get('/diagnoses');
            
            const criticalCases = diagnoses.filter(d => d.severity === 'Critical' || d.severity === 'High').length;

            statsHtml = `
                <div class="glass-card stat-card">
                    <div class="stat-icon"><i class="fas fa-user-md"></i></div>
                    <div class="stat-info">
                        <h3>${doctors.length}</h3>
                        <p>Total Doctors</p>
                    </div>
                </div>
                ${statsHtml}
                <div class="glass-card stat-card warning">
                    <div class="stat-icon"><i class="fas fa-notes-medical"></i></div>
                    <div class="stat-info">
                        <h3>${diagnoses.length}</h3>
                        <p>Total Diagnoses</p>
                    </div>
                </div>
                <div class="glass-card stat-card danger">
                    <div class="stat-icon"><i class="fas fa-heartbeat"></i></div>
                    <div class="stat-info">
                        <h3>${criticalCases}</h3>
                        <p>High/Critical Cases</p>
                    </div>
                </div>
            `;
        }

        document.getElementById('stats-container').innerHTML = statsHtml;

        // Render Recent Patients
        const recentPatients = [...patients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        document.getElementById('recent-patients-table').querySelector('tbody').innerHTML = recentPatients.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.firstName} ${p.lastName}</td>
                <td>${p.department}</td>
                <td><span class="badge ${p.status === 'Critical' ? 'badge-critical' : p.status === 'Monitoring' ? 'badge-warning' : 'badge-success'}">${p.status}</span></td>
            </tr>
        `).join('');

        // Render Activity or Diagnoses depending on role
        if (role === 'administrator') {
            document.getElementById('side-feed-title').textContent = 'Recent Audit Logs';
            const logs = await api.get('/audit-logs');
            const recentLogs = logs.slice(0, 6);
            
            document.getElementById('recent-activity-feed').innerHTML = recentLogs.map(l => `
                <div class="timeline-item">
                    <div class="timeline-time">${layout.formatDate(l.timestamp)}</div>
                    <div class="timeline-content"><strong>${l.user}</strong> ${l.action.toLowerCase()} ${l.entity.toLowerCase()}</div>
                </div>
            `).join('');
        } else if (role === 'clinician') {
            document.getElementById('side-feed-title').textContent = 'Recent Diagnoses';
            const diagnoses = await api.get('/diagnoses');
            const recentDiags = [...diagnoses].sort((a, b) => new Date(b.diagnosisDate) - new Date(a.diagnosisDate)).slice(0, 6);
            
            document.getElementById('recent-activity-feed').innerHTML = recentDiags.map(d => `
                <div class="timeline-item">
                    <div class="timeline-time">${layout.formatDate(d.diagnosisDate)}</div>
                    <div class="timeline-content">${d.description} (Pt: ${d.patientId})</div>
                </div>
            `).join('');
        } else {
            document.getElementById('side-feed-title').textContent = 'New Registrations';
            document.getElementById('recent-activity-feed').innerHTML = recentPatients.map(p => `
                <div class="timeline-item">
                    <div class="timeline-time">${layout.formatDate(p.createdAt)}</div>
                    <div class="timeline-content">Registered <strong>${p.firstName} ${p.lastName}</strong></div>
                </div>
            `).join('');
        }

        // Search Bar Logic
        const searchInput = document.getElementById('dashboard-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#recent-patients-table tbody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            });
        }

    } catch (err) {
        layout.showToast('Failed to load dashboard data', 'error');
    }
}
