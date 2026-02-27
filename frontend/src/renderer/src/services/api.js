/**
 * API Service
 * 
 * Axios instance configured for backend API communication
 */

import axios from 'axios';

// Get API URL based on environment
const getApiUrl = async () => {
    if (window.electron?.getApiUrl) {
        return await window.electron.getApiUrl();
    }
    // Fallback for web
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Create axios instance
const api = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Initialize API URL
let apiUrl = 'http://localhost:5000/api';

// Set up request interceptor to add auth token and API URL
api.interceptors.request.use(
    async (config) => {
        // Add API URL
        config.baseURL = apiUrl;

        // Get auth token
        let token;
        if (window.electron?.store) {
            token = await window.electron.store.get('auth_token');
        } else {
            token = localStorage.getItem('auth_token');
        }

        // Add Authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear auth data
            if (window.electron?.store) {
                await window.electron.store.delete('auth_token');
                await window.electron.store.delete('auth_user');
            } else {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }

            // Redirect to login
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle network errors
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

// Initialize API URL on load
(async () => {
    apiUrl = await getApiUrl();
})();

/**
 * API helper methods
 */

// GET request
export const get = async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
};

// POST request
export const post = async (url, data = {}) => {
    const response = await api.post(url, data);
    return response.data;
};

// PUT request
export const put = async (url, data = {}) => {
    const response = await api.put(url, data);
    return response.data;
};

// PATCH request
export const patch = async (url, data = {}) => {
    const response = await api.patch(url, data);
    return response.data;
};

// DELETE request
export const del = async (url) => {
    const response = await api.delete(url);
    return response.data;
};

// Upload file
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

// Download file
export const download = async (url, filename) => {
    const response = await api.get(url, {
        responseType: 'blob'
    });

    // Create download link
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

// Export axios instance as default
export default api;
