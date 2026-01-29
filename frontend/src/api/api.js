import axios from 'axios';
import { getInitData } from '../utils/telegram';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth header to all requests
api.interceptors.request.use((config) => {
  const initData = getInitData();
  if (initData) {
    config.headers.Authorization = `tma ${initData}`;
  }
  return config;
});

// API methods
export const authAPI = {
  login: (initData) => api.post('/auth/login', { init_data: initData }),
  me: () => api.get('/auth/me'),
};

export const directionsAPI = {
  getAll: () => api.get('/directions'),
  getOne: (id) => api.get(`/directions/${id}`),
  create: (data) => api.post('/directions', data),
  update: (id, data) => api.put(`/directions/${id}`, data),
  delete: (id) => api.delete(`/directions/${id}`),
};

export const coursesAPI = {
  getByDirection: (directionId) => api.get('/courses', { params: { direction_id: directionId } }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const materialsAPI = {
  getOne: (id) => api.get(`/materials/${id}`),
  updateProgress: (id, data) => api.post(`/materials/${id}/progress`, data),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
};

export const userAPI = {
  getProgress: (courseId) => api.get('/user/progress', { params: { course_id: courseId } }),
  updateDirection: (directionId) => api.put('/user/direction', { direction_id: directionId }),
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (materialId) => api.post(`/favorites/${materialId}`),
  remove: (materialId) => api.delete(`/favorites/${materialId}`),
};

export const gamificationAPI = {
  getLeaderboard: (limit = 10) => api.get('/leaderboard', { params: { limit } }),
  getAchievements: () => api.get('/achievements'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
