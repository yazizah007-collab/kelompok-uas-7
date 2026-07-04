import api from './axios'

export const getPengeluaranByTambak = (tambakId) => api.get(`/tambak/${tambakId}/pengeluaran`)
export const createPengeluaran = (tambakId, data) => api.post(`/tambak/${tambakId}/pengeluaran`, data)
export const updatePengeluaran = (id, data) => api.put(`/tambak/pengeluaran/${id}`, data)
export const deletePengeluaran = (id) => api.delete(`/tambak/pengeluaran/${id}`)
export const getLaporan = (tambakId, params) => api.get(`/tambak/${tambakId}/laporan`, { params })