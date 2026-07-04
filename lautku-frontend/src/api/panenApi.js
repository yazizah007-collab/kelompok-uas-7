import api from './axios'
import { tambakApi } from './tambakApi'

export const panenApi = {
  // Ambil siklus panen untuk satu tambak
  getByTambak: (tambakId) => api.get(`/tambak/${tambakId}/panen`),

  // Ambil semua siklus panen milik nelayan (gabungan dari semua tambaknya)
  getAll: async () => {
    const tambakRes = await tambakApi.getAll()
    const tambaks = tambakRes.data || []
    const results = await Promise.all(
      tambaks.map(t =>
        api.get(`/tambak/${t.id}/panen`).catch(() => ({ data: [] }))
      )
    )
    const data = results.flatMap(r => r.data || [])
    return { data }
  },

  // Tambah siklus panen baru. data harus berisi tambak_id
  create: (data) => {
    const { tambak_id, ...payload } = data
    return api.post(`/tambak/${tambak_id}/panen`, payload)
  },

  // Update status/hasil siklus panen
  update: (id, data) => api.put(`/tambak/panen/${id}`, data)
}