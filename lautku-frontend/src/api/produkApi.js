import api from './axios'

export const produkApi = {
  getAll: (params) => api.get('/produk', { params }),

  getById: (id) => api.get(`/produk/${id}`),

  getByKategori: (kategoriId) => api.get('/produk', { params: { kategori_id: kategoriId } }),

  getMyProducts: () => api.get('/produk/milik-saya'),

  create: (data) => api.post('/produk', data),

  update: (id, data) => api.put(`/produk/${id}`, data),

  delete: (id) => api.delete(`/produk/${id}`),

  getKategoris: () => api.get('/produk/kategori'),

  search: (query) => api.get('/produk', { params: { search: query } })
}