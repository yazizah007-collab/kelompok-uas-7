<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h2>🌿 Siklus Panen</h2>
          <p class="text-gray-500 text-sm">Kelola siklus panen tambak Anda</p>
        </div>
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? '✕ Batal' : '+ Tambah Siklus' }}
        </button>
      </div>

      <!-- Form Tambah Siklus Panen -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-6"
      >
        <div class="card form-card" v-if="showForm">
          <h3>📝 Tambah Siklus Panen</h3>
          
          <div class="form-grid">
            <div class="form-group full-width">
              <label>🌾 Pilih Tambak <span class="required">*</span></label>
              <select v-model="form.tambak_id" :class="{ 'input-error': errors.tambak_id }">
                <option value="">-- Pilih Tambak --</option>
                <option v-for="t in tambaks" :key="t.id" :value="t.id">
                  {{ t.nama_tambak || t.nama }}
                </option>
              </select>
              <span v-if="errors.tambak_id" class="error-text">{{ errors.tambak_id }}</span>
            </div>

            <div class="form-group">
              <label>📅 Tanggal Tebar <span class="required">*</span></label>
              <input 
                v-model="form.tanggal_tebar" 
                type="date"
                :class="{ 'input-error': errors.tanggal_tebar }"
              />
              <span v-if="errors.tanggal_tebar" class="error-text">{{ errors.tanggal_tebar }}</span>
            </div>

            <div class="form-group">
              <label>📅 Rencana Panen <span class="required">*</span></label>
              <input 
                v-model="form.tanggal_panen_rencana" 
                type="date"
                :class="{ 'input-error': errors.tanggal_panen_rencana }"
              />
              <span v-if="errors.tanggal_panen_rencana" class="error-text">{{ errors.tanggal_panen_rencana }}</span>
            </div>

            <div class="form-group">
              <label>🐟 Jumlah Tebar (ekor) <span class="required">*</span></label>
              <input 
                v-model="form.jumlah_tebar" 
                type="number" 
                placeholder="0"
                :class="{ 'input-error': errors.jumlah_tebar }"
                @blur="validateField('jumlah_tebar')"
              />
              <span v-if="errors.jumlah_tebar" class="error-text">{{ errors.jumlah_tebar }}</span>
            </div>

            <div class="form-group full-width">
              <label>📝 Catatan</label>
              <textarea 
                v-model="form.catatan" 
                rows="2" 
                placeholder="Catatan opsional..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="savePanen" :disabled="loading">
              {{ loading ? '⏳ Menyimpan...' : '💾 Simpan Siklus' }}
            </button>
            <button class="btn btn-outline" @click="resetForm">
              🔄 Reset
            </button>
          </div>
        </div>
      </transition>

      <!-- Statistik -->
      <div class="stats" v-if="panens.length > 0">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            🌿
          </div>
          <div>
            <p class="stat-label">Total Siklus</p>
            <h3>{{ panens.length }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-yellow-100 text-yellow-600">
            ⏳
          </div>
          <div>
            <p class="stat-label">Berlangsung</p>
            <h3>{{ panenBerlangsung }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            ✅
          </div>
          <div>
            <p class="stat-label">Selesai</p>
            <h3>{{ panenSelesai }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-red-100 text-red-600">
            ❌
          </div>
          <div>
            <p class="stat-label">Gagal</p>
            <h3>{{ panenGagal }}</h3>
          </div>
        </div>
      </div>

      <!-- Tabel Siklus Panen -->
      <div class="card table-card">
        <div class="table-header">
          <h3>📋 Daftar Siklus Panen</h3>
          <span class="data-count" v-if="panens.length > 0">
            {{ panens.length }} siklus
          </span>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat data siklus panen...</p>
        </div>

        <div v-else-if="panens.length === 0" class="empty-state">
          <p class="empty-icon">🌿</p>
          <p class="empty-text">Belum ada siklus panen</p>
          <p class="empty-subtext">Mulai catat siklus panen tambak Anda</p>
          <button class="btn btn-primary" @click="showForm = true">
            + Tambah Siklus
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>🌾 Tambak</th>
                <th>📅 Tgl Tebar</th>
                <th>📅 Rencana Panen</th>
                <th>🐟 Jumlah Tebar</th>
                <th>📦 Hasil (kg)</th>
                <th>📊 Status</th>
                <th>⚡ Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in panens" :key="p.id">
                <td>{{ index + 1 }}</td>
                <td>{{ getNamaTambak(p.tambak_id) }}</td>
                <td>{{ formatDate(p.tanggal_tebar) }}</td>
                <td>{{ formatDate(p.tanggal_panen_rencana) }}</td>
                <td>{{ p.jumlah_tebar?.toLocaleString('id-ID') || '-' }}</td>
                <td>{{ p.hasil_panen || '-' }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(p.status)]">
                    {{ getStatusLabel(p.status) }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn-action btn-edit" 
                    @click="editPanen(p)"
                    title="Update Status"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Update Status -->
      <div class="modal-overlay" v-if="showUpdate" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>✏️ Update Siklus Panen</h3>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>📊 Status <span class="required">*</span></label>
              <select v-model="updateForm.status" :class="{ 'input-error': errors.updateStatus }">
                <option value="berlangsung">⏳ Berlangsung</option>
                <option value="selesai">✅ Selesai</option>
                <option value="gagal">❌ Gagal</option>
              </select>
              <span v-if="errors.updateStatus" class="error-text">{{ errors.updateStatus }}</span>
            </div>

            <div class="form-group">
              <label>📅 Tanggal Panen Aktual</label>
              <input v-model="updateForm.tanggal_panen_aktual" type="date" />
            </div>

            <div class="form-group">
              <label>📦 Hasil Panen (kg)</label>
              <input 
                v-model="updateForm.hasil_panen" 
                type="number" 
                step="0.1" 
                placeholder="0"
                @blur="validateUpdateField('hasil_panen')"
              />
              <span v-if="errors.hasil_panen" class="error-text">{{ errors.hasil_panen }}</span>
            </div>

            <div class="form-group">
              <label>📝 Catatan</label>
              <textarea v-model="updateForm.catatan" rows="2" placeholder="Catatan tambahan..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" @click="saveUpdate" :disabled="loading">
              {{ loading ? '⏳ Menyimpan...' : '💾 Simpan' }}
            </button>
            <button class="btn btn-outline" @click="closeModal">
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { tambakApi, panenApi } from '../../api'

// ========================================
// STATE
// ========================================
const tambaks = ref([])
const panens = ref([])
const showForm = ref(false)
const showUpdate = ref(false)
const editId = ref(null)
const loading = ref(false)

const form = ref({
  tambak_id: '',
  tanggal_tebar: '',
  tanggal_panen_rencana: '',
  jumlah_tebar: '',
  catatan: ''
})

const updateForm = ref({
  status: '',
  tanggal_panen_aktual: '',
  hasil_panen: '',
  catatan: ''
})

const errors = ref({
  tambak_id: '',
  tanggal_tebar: '',
  tanggal_panen_rencana: '',
  jumlah_tebar: '',
  updateStatus: '',
  hasil_panen: ''
})

// ========================================
// COMPUTED
// ========================================
const panenBerlangsung = computed(() => {
  return panens.value.filter(p => p.status === 'berlangsung').length
})

const panenSelesai = computed(() => {
  return panens.value.filter(p => p.status === 'selesai').length
})

const panenGagal = computed(() => {
  return panens.value.filter(p => p.status === 'gagal').length
})

// ========================================
// METHODS
// ========================================
const toggleForm = () => {
  if (showForm.value) {
    resetForm()
  } else {
    showForm.value = true
  }
}

const resetForm = () => {
  form.value = {
    tambak_id: '',
    tanggal_tebar: '',
    tanggal_panen_rencana: '',
    jumlah_tebar: '',
    catatan: ''
  }
  errors.value = { tambak_id: '', tanggal_tebar: '', tanggal_panen_rencana: '', jumlah_tebar: '', updateStatus: '', hasil_panen: '' }
  showForm.value = false
}

const closeModal = () => {
  showUpdate.value = false
  updateForm.value = { status: '', tanggal_panen_aktual: '', hasil_panen: '', catatan: '' }
  errors.value.updateStatus = ''
  errors.value.hasil_panen = ''
  editId.value = null
}

const validateField = (field) => {
  if (field === 'jumlah_tebar') {
    const val = parseInt(form.value.jumlah_tebar)
    if (!form.value.jumlah_tebar) {
      errors.value.jumlah_tebar = 'Jumlah tebar wajib diisi'
    } else if (val <= 0) {
      errors.value.jumlah_tebar = 'Jumlah tebar harus lebih dari 0'
    } else {
      errors.value.jumlah_tebar = ''
    }
  }
}

const validateUpdateField = (field) => {
  if (field === 'hasil_panen') {
    const val = parseFloat(updateForm.value.hasil_panen)
    if (updateForm.value.status === 'selesai' && (!updateForm.value.hasil_panen || val <= 0)) {
      errors.value.hasil_panen = 'Hasil panen wajib diisi untuk status Selesai'
    } else {
      errors.value.hasil_panen = ''
    }
  }
}

const getNamaTambak = (id) => {
  const tambak = tambaks.value.find(t => t.id === id)
  return tambak?.nama_tambak || tambak?.nama || '-'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getStatusClass = (status) => {
  const map = {
    'berlangsung': 'status-berlangsung',
    'selesai': 'status-selesai',
    'gagal': 'status-gagal'
  }
  return map[status] || 'status-berlangsung'
}

const getStatusLabel = (status) => {
  const map = {
    'berlangsung': '⏳ Berlangsung',
    'selesai': '✅ Selesai',
    'gagal': '❌ Gagal'
  }
  return map[status] || status || 'Berlangsung'
}

const fetchTambak = async () => {
  try {
    const res = await tambakApi.getAll()
    tambaks.value = res.data || []
  } catch (err) {
    console.error('Error fetching tambak:', err)
    tambaks.value = []
  }
}

const fetchAllPanen = async () => {
  try {
    loading.value = true
    const allPanen = []
    for (const t of tambaks.value) {
      try {
        const res = await panenApi.getByTambak(t.id)
        if (res.data && Array.isArray(res.data)) {
          allPanen.push(...res.data)
        }
      } catch (err) {
        console.error(`Error fetching panen for tambak ${t.id}:`, err)
      }
    }
    panens.value = allPanen
  } catch (err) {
    console.error('Error fetching panen:', err)
    panens.value = []
  } finally {
    loading.value = false
  }
}

const savePanen = async () => {
  // Validate
  let isValid = true
  errors.value = { tambak_id: '', tanggal_tebar: '', tanggal_panen_rencana: '', jumlah_tebar: '', updateStatus: '', hasil_panen: '' }

  if (!form.value.tambak_id) {
    errors.value.tambak_id = 'Pilih tambak'
    isValid = false
  }
  if (!form.value.tanggal_tebar) {
    errors.value.tanggal_tebar = 'Tanggal tebar wajib diisi'
    isValid = false
  }
  if (!form.value.tanggal_panen_rencana) {
    errors.value.tanggal_panen_rencana = 'Rencana panen wajib diisi'
    isValid = false
  }
  if (!form.value.jumlah_tebar || parseInt(form.value.jumlah_tebar) <= 0) {
    errors.value.jumlah_tebar = 'Masukkan jumlah tebar yang valid'
    isValid = false
  }

  if (!isValid) return

  try {
    loading.value = true
    await panenApi.create({
      ...form.value,
      jumlah_tebar: parseInt(form.value.jumlah_tebar)
    })
    resetForm()
    await fetchAllPanen()
  } catch (err) {
    console.error('Error saving panen:', err)
    const message = err.response?.data?.message || 'Gagal menyimpan siklus panen. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const editPanen = (p) => {
  editId.value = p.id
  updateForm.value = {
    status: p.status || 'berlangsung',
    tanggal_panen_aktual: p.tanggal_panen_aktual || '',
    hasil_panen: p.hasil_panen || '',
    catatan: p.catatan || ''
  }
  errors.value.updateStatus = ''
  errors.value.hasil_panen = ''
  showUpdate.value = true
}

const saveUpdate = async () => {
  // Validate
  let isValid = true
  errors.value.updateStatus = ''
  errors.value.hasil_panen = ''

  if (!updateForm.value.status) {
    errors.value.updateStatus = 'Status wajib dipilih'
    isValid = false
  }

  if (updateForm.value.status === 'selesai') {
    if (!updateForm.value.hasil_panen || parseFloat(updateForm.value.hasil_panen) <= 0) {
      errors.value.hasil_panen = 'Hasil panen wajib diisi untuk status Selesai'
      isValid = false
    }
  }

  if (!isValid) return

  try {
    loading.value = true
    const payload = {
      ...updateForm.value,
      hasil_panen: updateForm.value.hasil_panen ? parseFloat(updateForm.value.hasil_panen) : null
    }
    await panenApi.update(editId.value, payload)
    closeModal()
    await fetchAllPanen()
  } catch (err) {
    console.error('Error updating panen:', err)
    const message = err.response?.data?.message || 'Gagal memperbarui siklus panen. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(async () => {
  await fetchTambak()
  await fetchAllPanen()
})
</script>

<style scoped>
/* ========================================
   DASHBOARD LAYOUT
   ======================================== */
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

/* ========================================
   TOPBAR
   ======================================== */
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

/* ========================================
   BUTTONS
   ======================================== */
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

/* ========================================
   CARD
   ======================================== */
.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

/* ========================================
   FORM
   ======================================== */
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

.form-group.full-width {
  grid-column: 1 / -1;
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
.form-group textarea,
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
.form-group textarea:focus,
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
  grid-column: 1 / -1;
}

/* ========================================
   STATS
   ======================================== */
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

/* ========================================
   TABLE
   ======================================== */
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

/* ========================================
   STATUS BADGE
   ======================================== */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-berlangsung {
  background: #fff3cd;
  color: #856404;
}

.status-selesai {
  background: #d4edda;
  color: #155724;
}

.status-gagal {
  background: #f8d7da;
  color: #721c24;
}

/* ========================================
   ACTION BUTTONS
   ======================================== */
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

.btn-edit {
  background: #e8f4fd;
  color: #1B6CA8;
}

.btn-edit:hover {
  background: #1B6CA8;
  color: white;
  transform: scale(1.1);
}

/* ========================================
   MODAL
   ======================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 500px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f8ff;
}

.modal-header h3 {
  color: #1B6CA8;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #e74c3c;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 2px solid #f0f8ff;
}

.modal-footer .btn {
  flex: 1;
  justify-content: center;
}

/* ========================================
   EMPTY STATE
   ======================================== */
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

/* ========================================
   LOADING SPINNER
   ======================================== */
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    grid-column: auto;
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

  .modal {
    padding: 20px;
    width: 95%;
  }

  .modal-footer {
    flex-direction: column;
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
}
</style>