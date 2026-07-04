<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <div class="topbar">
        <div>
          <h2>🌾 Tambak Saya</h2>
          <p class="text-gray-500 text-sm">Kelola semua tambak Anda</p>
        </div>
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? '✕ Batal' : '+ Tambah Tambak' }}
        </button>
      </div>

      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-6"
      >
        <div class="card form-card" v-if="showForm">
          <h3>{{ editId ? '✏️ Edit Tambak' : '📝 Tambah Tambak Baru' }}</h3>

          <div class="form-grid">
            <div class="form-group">
              <label>📌 Nama Tambak <span class="required">*</span></label>
              <input
                v-model="form.nama_tambak"
                placeholder="Masukkan nama tambak"
                :class="{ 'input-error': errors.nama_tambak }"
                @blur="validateField('nama_tambak')"
              />
              <span v-if="errors.nama_tambak" class="error-text">{{ errors.nama_tambak }}</span>
            </div>

            <div class="form-group">
              <label>📍 Lokasi <span class="required">*</span></label>
              <input
                v-model="form.lokasi"
                placeholder="Lokasi tambak"
                :class="{ 'input-error': errors.lokasi }"
                @blur="validateField('lokasi')"
              />
              <span v-if="errors.lokasi" class="error-text">{{ errors.lokasi }}</span>
            </div>

            <div class="form-group">
              <label>🐟 Jenis Budidaya <span class="required">*</span></label>
              <select v-model="form.jenis_budidaya" :class="{ 'input-error': errors.jenis_budidaya }">
                <option value="">-- Pilih Jenis --</option>
                <option value="Udang Vaname">🦐 Udang Vaname</option>
                <option value="Udang Windu">🦐 Udang Windu</option>
                <option value="Ikan Bandeng">🐟 Ikan Bandeng</option>
                <option value="Ikan Nila">🐟 Ikan Nila</option>
                <option value="Ikan Lele">🐟 Ikan Lele</option>
                <option value="Ikan Patin">🐟 Ikan Patin</option>
                <option value="Rumput Laut">🌿 Rumput Laut</option>
                <option value="Kerapu">🐠 Kerapu</option>
                <option value="Kepiting">🦀 Kepiting</option>
                <option value="Lainnya">📌 Lainnya</option>
              </select>
              <span v-if="errors.jenis_budidaya" class="error-text">{{ errors.jenis_budidaya }}</span>
            </div>

            <div class="form-group">
              <label>📏 Luas (Ha) <span class="required">*</span></label>
              <input
                v-model="form.luas"
                type="number"
                step="0.1"
                placeholder="0.0"
                :class="{ 'input-error': errors.luas }"
                @blur="validateField('luas')"
              />
              <span v-if="errors.luas" class="error-text">{{ errors.luas }}</span>
            </div>

            <div class="form-group">
              <label>📊 Status</label>
              <select v-model="form.status">
                <option value="aktif">✅ Aktif</option>
                <option value="inactive">⭕ Tidak Aktif</option>
                <option value="panen">🌿 Panen</option>
                <option value="kosong">🔄 Kosong</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="saveTambak" :disabled="loading">
              {{ loading ? '⏳ Menyimpan...' : editId ? '💾 Update Tambak' : '💾 Simpan Tambak' }}
            </button>
            <button class="btn btn-outline" @click="resetForm">
              🔄 Reset
            </button>
          </div>
        </div>
      </transition>

      <div class="stats" v-if="tambaks.length > 0">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            🌾
          </div>
          <div>
            <p class="stat-label">Total Tambak</p>
            <h3>{{ tambaks.length }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            ✅
          </div>
          <div>
            <p class="stat-label">Aktif</p>
            <h3>{{ tambakAktif }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-yellow-100 text-yellow-600">
            🌿
          </div>
          <div>
            <p class="stat-label">Panen</p>
            <h3>{{ tambakPanen }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-gray-100 text-gray-600">
            📏
          </div>
          <div>
            <p class="stat-label">Total Luas</p>
            <h3>{{ totalLuas }} Ha</h3>
          </div>
        </div>
      </div>

      <div class="card table-card">
        <div class="table-header">
          <h3>📋 Daftar Tambak</h3>
          <span class="data-count" v-if="tambaks.length > 0">
            {{ tambaks.length }} tambak
          </span>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat data tambak...</p>
        </div>

        <div v-else-if="tambaks.length === 0" class="empty-state">
          <p class="empty-icon">🌾</p>
          <p class="empty-text">Belum ada tambak</p>
          <p class="empty-subtext">Mulai tambahkan tambak Anda sekarang</p>
          <button class="btn btn-primary" @click="showForm = true">
            + Tambah Tambak
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>📌 Nama Tambak</th>
                <th>📍 Lokasi</th>
                <th>🐟 Jenis Budidaya</th>
                <th>📏 Luas (Ha)</th>
                <th>📊 Status</th>
                <th>⚡ Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(t, index) in tambaks" :key="t.id">
                <tr>
                  <td>{{ index + 1 }}</td>
                  <td class="tambak-name">{{ t.nama_tambak || t.nama }}</td>
                  <td>{{ t.lokasi }}</td>
                  <td>
                    <span class="category-badge">{{ t.jenis_budidaya || t.jenis }}</span>
                  </td>
                  <td>{{ t.luas || t.luas_ha || 0 }} Ha</td>
                  <td>
                    <span :class="['status-badge', getStatusClass(t.status)]">
                      {{ getStatusLabel(t.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-action btn-cuaca"
                        @click="toggleCuaca(t)"
                        title="Lihat Cuaca"
                      >
                        🌤️
                      </button>
                      <button
                        class="btn-action btn-edit"
                        @click="editTambak(t)"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        class="btn-action btn-delete"
                        @click="deleteTambak(t.id)"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="cuacaTambakId === t.id" class="cuaca-row">
                  <td colspan="7">
                    <div class="cuaca-panel">
                      <div v-if="cuacaLoading" class="cuaca-loading">
                        <div class="loading-spinner small"></div>
                        <span>Memuat data cuaca...</span>
                      </div>

                      <div v-else-if="cuacaError" class="cuaca-error">
                        ⚠️ {{ cuacaError }}
                      </div>

                      <div v-else-if="cuacaData" class="cuaca-content">
                        <div class="cuaca-current">
                          <div class="cuaca-icon">{{ cuacaData.saat_ini.icon }}</div>
                          <div class="cuaca-current-info">
                            <p class="cuaca-lokasi">📍 {{ cuacaData.lokasi }}</p>
                            <p class="cuaca-suhu">{{ cuacaData.saat_ini.suhu }}°C — {{ cuacaData.saat_ini.kondisi }}</p>
                            <div class="cuaca-detail">
                              <span>💧 Kelembapan {{ cuacaData.saat_ini.kelembapan }}%</span>
                              <span>💨 Angin {{ cuacaData.saat_ini.kecepatan_angin }} km/j</span>
                              <span>🌧️ Curah Hujan {{ cuacaData.saat_ini.curah_hujan }} mm</span>
                            </div>
                          </div>
                        </div>

                        <div class="cuaca-forecast">
                          <div v-for="f in cuacaData.prakiraan_3_hari" :key="f.tanggal" class="cuaca-forecast-item">
                            <span class="forecast-tanggal">{{ formatTanggalSingkat(f.tanggal) }}</span>
                            <span class="forecast-icon">{{ f.icon }}</span>
                            <span class="forecast-kondisi">{{ f.kondisi }}</span>
                            <span class="forecast-suhu">{{ f.suhu_min }}° - {{ f.suhu_max }}°</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="tambaks.length > 0" class="table-footer">
          <span class="text-sm text-gray-500">
            Total {{ tambaks.length }} tambak dengan luas total {{ totalLuas }} Ha
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { tambakApi } from '../../api'

const tambaks = ref([])
const showForm = ref(false)
const editId = ref(null)
const loading = ref(false)

const cuacaTambakId = ref(null)
const cuacaData = ref(null)
const cuacaLoading = ref(false)
const cuacaError = ref('')

const form = ref({
  nama_tambak: '',
  lokasi: '',
  luas: '',
  jenis_budidaya: '',
  status: 'aktif'
})

const errors = ref({
  nama_tambak: '',
  lokasi: '',
  luas: '',
  jenis_budidaya: ''
})

const tambakAktif = computed(() => {
  return tambaks.value.filter(t => t.status === 'aktif').length
})

const tambakPanen = computed(() => {
  return tambaks.value.filter(t => t.status === 'panen').length
})

const totalLuas = computed(() => {
  return tambaks.value.reduce((sum, t) => sum + parseFloat(t.luas || t.luas_ha || 0), 0)
})

const toggleForm = () => {
  if (showForm.value) {
    resetForm()
  } else {
    showForm.value = true
  }
}

const resetForm = () => {
  form.value = {
    nama_tambak: '',
    lokasi: '',
    luas: '',
    jenis_budidaya: '',
    status: 'aktif'
  }
  editId.value = null
  errors.value = { nama_tambak: '', lokasi: '', luas: '', jenis_budidaya: '' }
  showForm.value = false
}

const validateField = (field) => {
  if (field === 'nama_tambak') {
    if (!form.value.nama_tambak.trim()) {
      errors.value.nama_tambak = 'Nama tambak wajib diisi'
    } else {
      errors.value.nama_tambak = ''
    }
  }

  if (field === 'lokasi') {
    if (!form.value.lokasi.trim()) {
      errors.value.lokasi = 'Lokasi wajib diisi'
    } else {
      errors.value.lokasi = ''
    }
  }

  if (field === 'jenis_budidaya') {
    if (!form.value.jenis_budidaya) {
      errors.value.jenis_budidaya = 'Jenis budidaya wajib dipilih'
    } else {
      errors.value.jenis_budidaya = ''
    }
  }

  if (field === 'luas') {
    const val = parseFloat(form.value.luas)
    if (!form.value.luas) {
      errors.value.luas = 'Luas wajib diisi'
    } else if (val <= 0) {
      errors.value.luas = 'Luas harus lebih dari 0'
    } else {
      errors.value.luas = ''
    }
  }
}

const getStatusClass = (status) => {
  const map = {
    'aktif': 'status-aktif',
    'inactive': 'status-inactive',
    'panen': 'status-panen',
    'kosong': 'status-kosong'
  }
  return map[status] || 'status-aktif'
}

const getStatusLabel = (status) => {
  const map = {
    'aktif': '✅ Aktif',
    'inactive': '⭕ Tidak Aktif',
    'panen': '🌿 Panen',
    'kosong': '🔄 Kosong'
  }
  return map[status] || status || 'Aktif'
}

const formatTanggalSingkat = (tanggal) => {
  if (!tanggal) return '-'
  return new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const fetchTambak = async () => {
  try {
    loading.value = true
    const res = await tambakApi.getAll()
    tambaks.value = res.data || []
  } catch (err) {
    console.error('Error fetching tambak:', err)
    tambaks.value = []
  } finally {
    loading.value = false
  }
}

const toggleCuaca = async (tambak) => {
  if (cuacaTambakId.value === tambak.id) {
    cuacaTambakId.value = null
    cuacaData.value = null
    cuacaError.value = ''
    return
  }

  cuacaTambakId.value = tambak.id
  cuacaData.value = null
  cuacaError.value = ''
  cuacaLoading.value = true

  try {
    const res = await tambakApi.getCuaca(tambak.id)
    cuacaData.value = res.data
  } catch (err) {
    console.error('Error fetching cuaca:', err)
    cuacaError.value = err.response?.data?.message || 'Gagal memuat data cuaca. Silakan coba lagi.'
  } finally {
    cuacaLoading.value = false
  }
}

const saveTambak = async () => {
  validateField('nama_tambak')
  validateField('lokasi')
  validateField('jenis_budidaya')
  validateField('luas')

  let isValid = true
  for (const key in errors.value) {
    if (errors.value[key]) {
      isValid = false
      break
    }
  }

  if (!isValid) return

  try {
    loading.value = true
    const payload = {
      ...form.value,
      luas: parseFloat(form.value.luas)
    }

    if (editId.value) {
      await tambakApi.update(editId.value, payload)
    } else {
      await tambakApi.create(payload)
    }

    resetForm()
    await fetchTambak()
  } catch (err) {
    console.error('Error saving tambak:', err)
    const message = err.response?.data?.message || 'Gagal menyimpan tambak. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const editTambak = (tambak) => {
  editId.value = tambak.id
  form.value = {
    nama_tambak: tambak.nama_tambak || tambak.nama || '',
    lokasi: tambak.lokasi || '',
    luas: tambak.luas || tambak.luas_ha || '',
    jenis_budidaya: tambak.jenis_budidaya || tambak.jenis || '',
    status: tambak.status || 'aktif'
  }
  errors.value = { nama_tambak: '', lokasi: '', luas: '', jenis_budidaya: '' }
  showForm.value = true
}

const deleteTambak = async (id) => {
  if (!confirm('⚠️ Yakin ingin menghapus tambak ini? Tindakan ini tidak dapat dibatalkan!')) return

  try {
    loading.value = true
    await tambakApi.delete(id)
    await fetchTambak()
  } catch (err) {
    console.error('Error deleting tambak:', err)
    const message = err.response?.data?.message || 'Gagal menghapus tambak. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTambak()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f0f8ff;
}

.main {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e8f4fd;
}

.topbar h2 {
  color: #1B6CA8;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.topbar p {
  margin: 4px 0 0 0;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #1B6CA8;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #154f7a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 108, 168, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: #1B6CA8;
  border: 2px solid #1B6CA8;
}

.btn-outline:hover {
  background: #1B6CA8;
  color: white;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

.form-card h3 {
  color: #1B6CA8;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
}

.form-group .required {
  color: #e74c3c;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1B6CA8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 108, 168, 0.1);
}

.form-group .input-error {
  border-color: #e74c3c;
}

.form-group .input-error:focus {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  display: block;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f0f8ff;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-label {
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.stat-card h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.table-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f8ff;
}

.data-count {
  background: #1B6CA8;
  color: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #1B6CA8;
  color: white;
  border-radius: 10px;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  vertical-align: middle;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

.tambak-name {
  font-weight: 500;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #e8f4fd;
  color: #1B6CA8;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-aktif {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #e2e3e5;
  color: #383d41;
}

.status-panen {
  background: #cce5ff;
  color: #004085;
}

.status-kosong {
  background: #fff3cd;
  color: #856404;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-cuaca {
  background: #e0f2fe;
  color: #0369a1;
}

.btn-cuaca:hover {
  background: #0369a1;
  color: white;
  transform: scale(1.1);
}

.btn-edit {
  background: #e8f4fd;
  color: #1B6CA8;
}

.btn-edit:hover {
  background: #1B6CA8;
  color: white;
  transform: scale(1.1);
}

.btn-delete {
  background: #f8d7da;
  color: #e74c3c;
}

.btn-delete:hover {
  background: #e74c3c;
  color: white;
  transform: scale(1.1);
}

.cuaca-row td {
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
}

.cuaca-panel {
  background: #f0f8ff;
  padding: 20px;
  border-left: 4px solid #1B6CA8;
}

.cuaca-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6c757d;
  font-size: 14px;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 3px;
  margin: 0;
}

.cuaca-error {
  color: #e74c3c;
  font-size: 14px;
  font-weight: 500;
}

.cuaca-content {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.cuaca-current {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cuaca-icon {
  font-size: 48px;
}

.cuaca-lokasi {
  font-size: 13px;
  color: #6c757d;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.cuaca-suhu {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.cuaca-detail {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #6c757d;
}

.cuaca-forecast {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  border-left: 1px solid #d0e4f5;
  padding-left: 24px;
}

.cuaca-forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 80px;
  background: white;
  border-radius: 10px;
  padding: 10px 12px;
}

.forecast-tanggal {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.forecast-icon {
  font-size: 24px;
  margin: 2px 0;
}

.forecast-kondisi {
  font-size: 11px;
  color: #1a1a2e;
  text-align: center;
}

.forecast-suhu {
  font-size: 13px;
  font-weight: 600;
  color: #1B6CA8;
}

.table-footer {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 2px solid #f0f8ff;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.empty-subtext {
  color: #6c757d;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e8f4fd;
  border-top: 4px solid #1B6CA8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main {
    padding: 16px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .topbar h2 {
    font-size: 20px;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .table th,
  .table td {
    padding: 8px 12px;
    font-size: 13px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .cuaca-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .cuaca-forecast {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #d0e4f5;
    padding-top: 16px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 16px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .table th,
  .table td {
    padding: 6px 8px;
    font-size: 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>