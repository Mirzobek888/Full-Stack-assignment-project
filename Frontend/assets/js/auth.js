const auth = {
    login: async (username, password) => {
        try {
            const res = await api.post('/auth/login', { username, password });
            if (res.token && res.user) {
                localStorage.setItem('caretrack_token', res.token);
                localStorage.setItem('caretrack_user', JSON.stringify(res.user));
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // ignore error
        } finally {
            localStorage.removeItem('caretrack_token');
            localStorage.removeItem('caretrack_user');
            window.location.href = '/login.html';
        }
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('caretrack_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    hasRole: (allowedRoles) => {
        const user = auth.getCurrentUser();
        if (!user || !user.role) return false;
        return allowedRoles.includes(user.role);
    },

    requireAuth: () => {
        const user = auth.getCurrentUser();
        if (!user) {
            window.location.href = '/login.html';
            return null;
        }
        return user;
    },

    requireRole: (allowedRoles) => {
        const user = auth.requireAuth();
        if (user && !allowedRoles.includes(user.role)) {
            auth.redirectIfForbidden();
        }
    },

    redirectIfForbidden: () => {
        window.location.href = '/dashboard.html';
    }
};
