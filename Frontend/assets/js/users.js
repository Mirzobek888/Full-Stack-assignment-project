let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    auth.requireRole(['administrator']);
    layout.init();

    await loadUsers();

    document.getElementById('search-input').addEventListener('input', renderUsers);
    document.getElementById('filter-role').addEventListener('change', renderUsers);

    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
});

async function loadUsers() {
    try {
        allUsers = await api.get('/users');
        renderUsers();
    } catch (err) {
        layout.showToast('Failed to load users', 'error');
    }
}

function renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('filter-role').value;

    const filtered = allUsers.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm) || u.username.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter ? u.role === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    const currentUser = auth.getCurrentUser();

    tbody.innerHTML = filtered.map(u => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="avatar" style="width:32px; height:32px; font-size:12px;">${layout.getAvatarInitials(u.name)}</div>
                    ${u.name}
                </div>
            </td>
            <td>${u.username}</td>
            <td><span class="badge badge-neutral" style="text-transform:capitalize;">${u.role}</span></td>
            <td>${u.department || '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="editUser('${u.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    ${u.id !== currentUser.id ? `
                    <button class="btn-icon" style="color:var(--danger);" onclick="deleteUser('${u.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No users found</td></tr>`;
    }
}

function openUserModal() {
    document.getElementById('modal-title').textContent = 'Add User';
    document.getElementById('user-form').reset();
    document.getElementById('userId').value = '';
    document.getElementById('u-password').required = true;
    document.getElementById('pwd-group').style.display = 'block';
    document.getElementById('user-modal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

function editUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('modal-title').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('u-name').value = user.name;
    document.getElementById('u-username').value = user.username;
    document.getElementById('u-role').value = user.role;
    document.getElementById('u-dept').value = user.department || '';
    
    // Password is not required for editing
    document.getElementById('u-password').required = false;
    // We could hide password field or leave it optional for password reset. Let's keep it optional.
    document.getElementById('u-password').value = '';
    document.getElementById('u-password').placeholder = 'Leave blank to keep current';

    document.getElementById('user-modal').style.display = 'flex';
}

async function handleUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    
    const data = {
        name: document.getElementById('u-name').value,
        username: document.getElementById('u-username').value,
        role: document.getElementById('u-role').value,
        department: document.getElementById('u-dept').value
    };

    const pwd = document.getElementById('u-password').value;
    if (pwd) {
        data.password = pwd;
    }

    try {
        if (id) {
            await api.put(`/users/${id}`, data);
            layout.showToast('User updated successfully');
        } else {
            await api.post('/users', data);
            layout.showToast('User created successfully');
        }
        closeUserModal();
        await loadUsers();
    } catch (err) {
        layout.showToast(err.message, 'error');
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await api.delete(`/users/${id}`);
            layout.showToast('User deleted successfully');
            await loadUsers();
        } catch (err) {
            layout.showToast(err.message, 'error');
        }
    }
}
