const layout = {
    renderSidebar: () => {
        const user = auth.getCurrentUser();
        if (!user) return;

        const sidebar = document.getElementById('sidebar-nav');
        if (!sidebar) return;

        // Check if sidebar already has content to avoid unnecessary re-rendering
        if (sidebar.children.length > 0) {
            layout.updateActiveNav();
            return;
        }

        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

        let html = `
            <a href="dashboard.html" class="nav-item ${currentPath.includes('dashboard') ? 'active' : ''}">
                <i class="fas fa-home"></i> Dashboard
            </a>
        `;

        if (auth.hasRole(['administrator', 'clinician', 'receptionist'])) {
            html += `
                <a href="patients.html" class="nav-item ${currentPath.includes('patient') ? 'active' : ''}">
                    <i class="fas fa-user-injured"></i> Patients
                </a>
                <a href="doctors.html" class="nav-item ${currentPath.includes('doctor') ? 'active' : ''}">
                    <i class="fas fa-user-md"></i> Doctors
                </a>
                <a href="schedules.html" class="nav-item ${currentPath.includes('schedule') ? 'active' : ''}">
                    <i class="fas fa-calendar-alt"></i> Schedules
                </a>
            `;
        }

        if (auth.hasRole(['administrator', 'clinician'])) {
            html += `
                <a href="diagnoses.html" class="nav-item ${currentPath.includes('diagnos') ? 'active' : ''}">
                    <i class="fas fa-notes-medical"></i> Diagnoses
                </a>
                <a href="reports.html" class="nav-item ${currentPath.includes('report') ? 'active' : ''}">
                    <i class="fas fa-file-medical-alt"></i> Reports
                </a>
            `;
        }

        if (auth.hasRole(['administrator'])) {
            html += `
                <a href="users.html" class="nav-item ${currentPath.includes('user') ? 'active' : ''}">
                    <i class="fas fa-users-cog"></i> User Management
                </a>
                <a href="settings.html" class="nav-item ${currentPath.includes('setting') ? 'active' : ''}">
                    <i class="fas fa-cog"></i> Settings
                </a>
                <a href="audit-logs.html" class="nav-item ${currentPath.includes('audit') ? 'active' : ''}">
                    <i class="fas fa-history"></i> Audit Logs
                </a>
            `;
        }

        html += `
            <a href="#" onclick="auth.logout()" class="nav-item" style="margin-top: auto;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        `;

        sidebar.innerHTML = html;
    },

    updateActiveNav: () => {
        const sidebar = document.getElementById('sidebar-nav');
        if (!sidebar) return;

        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

        // Remove active class from all nav items
        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current nav item
        sidebar.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href') || '';
            if (href === '#' && currentPath.includes('logout')) return;
            
            if (currentPath.includes('dashboard') && href.includes('dashboard')) {
                item.classList.add('active');
            } else if (currentPath.includes('patient') && href.includes('patient')) {
                item.classList.add('active');
            } else if (currentPath.includes('doctor') && href.includes('doctor')) {
                item.classList.add('active');
            } else if (currentPath.includes('schedule') && href.includes('schedule')) {
                item.classList.add('active');
            } else if (currentPath.includes('diagnos') && href.includes('diagnos')) {
                item.classList.add('active');
            } else if (currentPath.includes('report') && href.includes('report')) {
                item.classList.add('active');
            } else if (currentPath.includes('user') && href.includes('user')) {
                item.classList.add('active');
            } else if (currentPath.includes('setting') && href.includes('setting')) {
                item.classList.add('active');
            } else if (currentPath.includes('audit') && href.includes('audit')) {
                item.classList.add('active');
            }
        });
    },

    renderTopbar: () => {
        const user = auth.getCurrentUser();
        if (!user) return;

        const userNameEl = document.getElementById('topbar-user-name');
        const userRoleEl = document.getElementById('topbar-user-role');
        const avatarEl = document.getElementById('topbar-avatar');

        if (userNameEl) userNameEl.textContent = user.name;
        
        if (userRoleEl) {
            let roleDisplay = 'User';
            if (user.role === 'administrator') roleDisplay = 'Administrator';
            if (user.role === 'clinician') roleDisplay = 'Doctor';
            if (user.role === 'receptionist') roleDisplay = 'Receptionist';
            userRoleEl.textContent = roleDisplay;
        }

        if (avatarEl) {
            avatarEl.textContent = layout.getAvatarInitials(user.name);
        }
    },

    getAvatarInitials: (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },

    showToast: (message, type = 'success') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);

        setTimeout(() => {
            if(toast.parentElement) {
                toast.remove();
            }
        }, 3500);
    },

    formatDate: (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    formatDateTime: (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('en-US', options);
    },

    calculateAge: (dob) => {
        if (!dob) return '';
        const diffMs = Date.now() - new Date(dob).getTime();
        const ageDt = new Date(diffMs); 
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    },

    renderLogoText: () => {
        const logoContainer = document.querySelector('.sidebar-logo');
        if (logoContainer && !logoContainer.querySelector('.logo-text')) {
            const logoText = document.createElement('div');
            logoText.className = 'logo-text';
            logoText.innerHTML = '<span class="care">Care</span><span class="track">Track</span>';
            logoContainer.appendChild(logoText);
        }
    },

    init: () => {
        layout.renderSidebar();
        layout.renderTopbar();
        layout.renderLogoText();
    }
};
