import axios from 'axios';
import { API_URL } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  search: (query: string) => api.get(`/users/search?q=${query}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
};

// Patients API
export const patientsAPI = {
  getAll: () => api.get('/patients'),
  getMe: () => api.get('/patients/me'),
  getOne: (id: string) => api.get(`/patients/${id}`),
  getByQR: (token: string) => api.get(`/patients/qr/${token}`),
  update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
  generateQR: (id: string) => api.post(`/patients/${id}/generate-qr`),
  regenerateQR: (id: string) => api.post(`/patients/${id}/regenerate-qr`),
};

// Medical Records API
export const medicalRecordsAPI = {
  create: (data: any) => api.post('/medical-records', data),
  getByPatient: (patientId: string) => api.get(`/medical-records/patient/${patientId}`),
  getOne: (id: string) => api.get(`/medical-records/${id}`),
  update: (id: string, data: any) => api.patch(`/medical-records/${id}`, data),
  sign: (id: string, firma: string) => api.post(`/medical-records/${id}/sign`, { firma_digital: firma }),
  delete: (id: string) => api.delete(`/medical-records/${id}`),
};

// Files API
export const filesAPI = {
  upload: (formData: FormData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByPatient: (patientId: string, folder?: string) => {
    const url = folder ? `/files/patient/${patientId}?folder=${folder}` : `/files/patient/${patientId}`;
    return api.get(url);
  },
  delete: (id: string) => api.delete(`/files/${id}`),
};

// Payments API
export const paymentsAPI = {
  create: (data: any) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
  getStatistics: () => api.get('/payments/statistics'),
  getByPatient: (patientId: string) => api.get(`/payments/patient/${patientId}`),
  getPending: (patientId: string) => api.get(`/payments/patient/${patientId}/pending`),
  markAsPaid: (id: string, data: any) => api.patch(`/payments/${id}/pay`, data),
};

// Notifications API
export const notificationsAPI = {
  getMe: () => api.get('/notifications/me'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (limit?: number) => api.get(`/activity-logs${limit ? `?limit=${limit}` : ''}`),
  getStatistics: () => api.get('/activity-logs/statistics'),
  getMe: () => api.get('/activity-logs/me'),
  getByPatient: (patientId: string) => api.get(`/activity-logs/patient/${patientId}`),
};
