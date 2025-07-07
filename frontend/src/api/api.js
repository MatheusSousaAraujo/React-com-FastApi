// src/api/api.js
import axios from 'axios';

// Cria uma instância do axios com a URL base da sua API FastAPI
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // A URL onde sua API FastAPI está rodando
});

// Interceptor que adiciona o token de autorização em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;