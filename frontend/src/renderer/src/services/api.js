import axios from 'axios';

const getApiUrl = async () => {
    if (window.electron?.getApiUrl) {
        const url = await window.electron.getApiUrl();
        console.log('[API] Getting URL from Electron:', url);
        return url;
    }
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    console.log('[API] Using VITE_API_URL or default:', url);
    return url;
};

const api = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

let apiUrl = 'http://localhost:5000/api';

api.interceptors.request.use(
    async (config) => {
        // Ensure apiUrl is set before each request
        if (!apiUrl || apiUrl === 'http://localhost:5000/api') {
            apiUrl = await getApiUrl();
        }
        config.baseURL = apiUrl;
        console.log('[API Request]', config.method?.toUpperCase(), config.baseURL + config.url);

        let token;
        if (window.electron?.store) {
            token = await window.electron.store.get('auth_token');
        } else {
            token = localStorage.getItem('auth_token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('[API Response]', response.config.url, response.status);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        console.error('[API Error]', originalRequest.url, error.response?.status, error.message);

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (window.electron?.store) {
                await window.electron.store.delete('auth_token');
                await window.electron.store.delete('auth_user');
            } else {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }

            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (!error.response) {
            error.response = {
                data: {
                    message: 'Network error. Please check your connection.'
                }
            };
        }

        return Promise.reject(error);
    }
);

(async () => {
    apiUrl = await getApiUrl();
})();

export const get = async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
};

export const post = async (url, data = {}) => {
    const response = await api.post(url, data);
    return response.data;
};

export const put = async (url, data = {}) => {
    const response = await api.put(url, data);
    return response.data;
};

export const patch = async (url, data = {}) => {
    const response = await api.patch(url, data);
    return response.data;
};

export const del = async (url) => {
    const response = await api.delete(url);
    return response.data;
};

export const upload = async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
            }
        }
    });

    return response.data;
};

export const download = async (url, filename) => {
    const response = await api.get(url, {
        responseType: 'blob'
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
};

export default api;
