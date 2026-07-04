import api from './axios'

export const orderApi = {
  getKeranjang: () => api.get('/orders/keranjang'),

  addToKeranjang: (produk_id, jumlah = 1) => api.post('/orders/keranjang', { produk_id, jumlah }),

  updateKeranjang: (id, jumlah) => api.put(`/orders/keranjang/${id}`, { jumlah }),

  deleteKeranjang: (id) => api.delete(`/orders/keranjang/${id}`),

  checkout: (data) => api.post('/orders/checkout', data),

  getAll: () => api.get('/orders'),

  getOrders: () => api.get('/orders'),

  getMyOrders: () => api.get('/orders'),

  getOrderById: (id) => api.get(`/orders/${id}`),

  getById: (id) => api.get(`/orders/${id}`),

  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),

  cancelOrder: (id) => api.put(`/orders/${id}/cancel`)
}
