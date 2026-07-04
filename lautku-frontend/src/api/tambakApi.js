import api from './axios'
import {
  getPengeluaranByTambak,
  createPengeluaran,
  updatePengeluaran,
  deletePengeluaran
} from './pengeluaranApi'

export const tambakApi = {
  getAll: () => api.get('/tambak'),
  getById: (id) => api.get(`/tambak/${id}`),
  create: (data) => api.post('/tambak', data),
  update: (id, data) => api.put(`/tambak/${id}`, data),
  delete: (id) => api.delete(`/tambak/${id}`),

  getPengeluaran: getPengeluaranByTambak,
  addPengeluaran: createPengeluaran,
  updatePengeluaran: updatePengeluaran,
  deletePengeluaran: deletePengeluaran,

  getCuaca: (tambakId) => api.get(`/cuaca/${tambakId}`)
}