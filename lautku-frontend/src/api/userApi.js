import api from './axios'

export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleSuspend: (id) => api.put(`/users/${id}/suspend`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data)
}