import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Points to your Express backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// Automatically attach the JWT token to every request if the user is logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('chess_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;