const API_BASE = 'https://full-stack-assignment-project.onrender.com/';

async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('caretrack_token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            // Handle unauthorized globally
            if (response.status === 401) {
                localStorage.removeItem('caretrack_token');
                localStorage.removeItem('caretrack_user');
                window.location.href = 'login.html';
            }
            const errorMessage = data?.error || `HTTP ${response.status}: ${response.statusText || 'Unknown Error'}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

const api = {
    get: (endpoint) => apiCall(endpoint, 'GET'),
    post: (endpoint, data) => apiCall(endpoint, 'POST', data),
    put: (endpoint, data) => apiCall(endpoint, 'PUT', data),
    delete: (endpoint) => apiCall(endpoint, 'DELETE')
};
