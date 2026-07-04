import api from './axios'

export const artikelApi = {
  // Public - hanya mengembalikan artikel berstatus 'publish'
  getAll: () => api.get('/artikel'),
  getPublished: () => api.get('/artikel'),
  getById: (id) => api.get(`/artikel/${id}`),

  // Admin - mengembalikan semua artikel (termasuk draft)
  getAdminArticles: () => api.get('/artikel/admin'),
  create: (data) => api.post('/artikel', data),
  update: (id, data) => api.put(`/artikel/${id}`, data),
  delete: (id) => api.delete(`/artikel/${id}`)
}