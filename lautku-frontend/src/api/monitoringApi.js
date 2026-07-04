import api from './axios'

export const monitoringApi = {
  getByTambak: (tambakId) => api.get(`/monitoring/${tambakId}`),
  create: (data) => api.post('/monitoring', data),
  delete: (id) => api.delete(`/monitoring/${id}`)
}