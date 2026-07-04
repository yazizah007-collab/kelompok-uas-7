<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h2>💧 Monitoring Kualitas Air</h2>
          <p class="text-gray-500 text-sm">Pantau kualitas air tambak Anda secara real-time</p>
        </div>
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? '✕ Batal' : '+ Input Data' }}
        </button>
      </div>

      <!-- Form Input Data -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-6"
      >
        <div class="card form-card" v-if="showForm">
          <h3>📝 Input Data Monitoring</h3>
          
          <div class="form-grid">
            <div class="form-group full-width">
              <label>🌾 Pilih Tambak <span class="required">*</span></label>
              <select v-model="form.tambak_id" @change="onTambakChange" :class="{ 'input-error': errors.tambak_id }">
                <option value="">-- Pilih Tambak --</option>
                <option v-for="t in tambaks" :key="t.id" :value="t.id">
                  {{ t.nama_tambak || t.nama }} - {{ t.lokasi }}
                </option>
              </select>
              <span v-if="errors.tambak_id" class="error-text">{{ errors.tambak_id }}</span>
            </div>

            <div class="form-group">
              <label>🧪 pH <span class="required">*</span></label>
              <input 
                v-model="form.ph" 
                type="number" 
                step="0.1" 
                placeholder="6.5 - 8.5"
                :class="{ 'input-error': errors.ph }"
                @blur="validateField('ph')"
              />
              <span v-if="errors.ph" class="error-text">{{ errors.ph }}</span>
              <span class="field-hint" :class="getPhStatus(form.ph)">
                {{ getPhStatus(form.ph) === 'good' ? '✅ Normal' : 
                   getPhStatus(form.ph) === 'warning' ? '⚠️ Perhatikan' : 
                   getPhStatus(form.ph) === 'danger' ? '❌ Berbahaya' : 'Masukkan nilai' }}
              </span>
            </div>

            <div class="form-group">
              <label>🌡️ Suhu (°C) <span class="required">*</span></label>
              <input 
                v-model="form.suhu" 
                type="number" 
                step="0.1" 
                placeholder="26 - 32"
                :class="{ 'input-error': errors.suhu }"
                @blur="validateField('suhu')"
              />
              <span v-if="errors.suhu" class="error-text">{{ errors.suhu }}</span>
              <span class="field-hint" :class="getSuhuStatus(form.suhu)">
                {{ getSuhuStatus(form.suhu) === 'good' ? '✅ Normal' : 
                   getSuhuStatus(form.suhu) === 'warning' ? '⚠️ Perhatikan' : 
                   getSuhuStatus(form.suhu) === 'danger' ? '❌ Berbahaya' : 'Masukkan nilai' }}
              </span>
            </div>

            <div class="form-group">
              <label>🧂 Salinitas (ppt)</label>
              <input 
                v-model="form.salinitas" 
                type="number" 
                step="0.1" 
                placeholder="10 - 30"
              />
            </div>

            <div class="form-group">
              <label>💨 Oksigen (mg/L) <span class="required">*</span></label>
              <input 
                v-model="form.oksigen" 
                type="number" 
                step="0.1" 
                placeholder="> 4"
                :class="{ 'input-error': errors.oksigen }"
                @blur="validateField('oksigen')"
              />
              <span v-if="errors.oksigen" class="error-text">{{ errors.oksigen }}</span>
            </div>

            <div class="form-group">
              <label>👁️ Kecerahan (cm)</label>
              <input 
                v-model="form.kecerahan" 
                type="number" 
                step="0.1" 
                placeholder="30 - 60"
              />
            </div>

            <div class="form-group full-width">
              <label>📝 Catatan</label>
              <textarea 
                v-model="form.catatan" 
                rows="2" 
                placeholder="Tambahan informasi (opsional)"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="saveMonitoring" :disabled="loading">
              {{ loading ? '⏳ Menyimpan...' : '💾 Simpan Data' }}
            </button>
            <button class="btn btn-outline" @click="resetForm">
              🔄 Reset
            </button>
          </div>
        </div>
      </transition>

      <!-- Filter & Pilih Tambak -->
      <div class="card filter-card">
        <div class="filter-grid">
          <div class="filter-group">
            <label>🌾 Pilih Tambak</label>
            <select v-model="selectedTambak" @change="fetchMonitoring" class="filter-select">
              <option value="">-- Semua Tambak --</option>
              <option v-for="t in tambaks" :key="t.id" :value="t.id">
                {{ t.nama_tambak || t.nama }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>📅 Periode</label>
            <select v-model="filterPeriode" class="filter-select">
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
              <option value="all">Semua Data</option>
            </select>
          </div>
          <div class="filter-group">
            <label>&nbsp;</label>
            <button class="btn btn-outline btn-refresh" @click="fetchMonitoring">
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Ringkasan Status -->
      <div class="status-summary" v-if="monitorings.length > 0">
        <div class="status-item">
          <span class="status-label">📊 Rata-rata pH</span>
          <span class="status-value">{{ average.ph?.toFixed(1) || '-' }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">🌡️ Rata-rata Suhu</span>
          <span class="status-value">{{ average.suhu?.toFixed(1) || '-' }}°C</span>
        </div>
        <div class="status-item">
          <span class="status-label">💨 Rata-rata Oksigen</span>
          <span class="status-value">{{ average.oksigen?.toFixed(1) || '-' }} mg/L</span>
        </div>
        <div class="status-item">
          <span class="status-label">📅 Total Data</span>
          <span class="status-value">{{ monitorings.length }}</span>
        </div>
      </div>

      <!-- Tabel Data -->
      <div class="card table-card">
        <div class="table-header">
          <h3>📋 Data Monitoring</h3>
          <span class="data-count" v-if="monitorings.length > 0">
            {{ monitorings.length }} data
          </span>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat data monitoring...</p>
        </div>

        <div v-else-if="monitorings.length === 0" class="empty-state">
          <p class="empty-icon">💧</p>
          <p class="empty-text">Belum ada data monitoring</p>
          <p class="empty-subtext">
            {{ selectedTambak ? 'Tambak ini belum memiliki data monitoring' : 'Pilih tambak untuk melihat data' }}
          </p>
          <button v-if="selectedTambak" class="btn btn-primary" @click="showForm = true">
            + Input Data Pertama
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>📅 Tanggal</th>
                <th>🧪 pH</th>
                <th>🌡️ Suhu</th>
                <th>🧂 Salinitas</th>
                <th>💨 Oksigen</th>
                <th>👁️ Kecerahan</th>
                <th>📝 Catatan</th>
                <th>⚡ Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in sortedMonitorings" :key="m.id">
                <td>{{ formatDate(m.tanggal || m.created_at) }}</td>
                <td>
                  <span :class="['value-badge', getPhStatus(m.ph)]">
                    {{ m.ph }}
                  </span>
                </td>
                <td>
                  <span :class="['value-badge', getSuhuStatus(m.suhu)]">
                    {{ m.suhu }}°C
                  </span>
                </td>
                <td>{{ m.salinitas || '-' }} ppt</td>
                <td>{{ m.oksigen || '-' }} mg/L</td>
                <td>{{ m.kecerahan || '-' }} cm</td>
                <td>{{ m.catatan || '-' }}</td>
                <td>
                  <button 
                    class="btn-action btn-delete" 
                    @click="deleteMonitoring(m.id)"
                    title="Hapus Data"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { tambakApi, monitoringApi } from '../../api'

// ========================================
// STATE
// ========================================
const tambaks = ref([])
const monitorings = ref([])
const showForm = ref(false)
const selectedTambak = ref('')
const loading = ref(false)
const filterPeriode = ref('30')

const form = ref({
  tambak_id: '',
  ph: '',
  suhu: '',
  salinitas: '',
  oksigen: '',
  kecerahan: '',
  catatan: ''
})

const errors = ref({
  tambak_id: '',
  ph: '',
  suhu: '',
  oksigen: ''
})

// ========================================
// COMPUTED
// ========================================
const sortedMonitorings = computed(() => {
  return [...monitorings.value].sort((a, b) => {
    const dateA = new Date(a.tanggal || a.created_at)
    const dateB = new Date(b.tanggal || b.created_at)
    return dateB - dateA
  })
})

const average = computed(() => {
  if (monitorings.value.length === 0) return { ph: 0, suhu: 0, oksigen: 0 }
  
  const total = monitorings.value.reduce((acc, m) => {
    acc.ph += parseFloat(m.ph) || 0
    acc.suhu += parseFloat(m.suhu) || 0
    acc.oksigen += parseFloat(m.oksigen) || 0
    return acc
  }, { ph: 0, suhu: 0, oksigen: 0 })

  const count = monitorings.value.length
  return {
    ph: total.ph / count,
    suhu: total.suhu / count,
    oksigen: total.oksigen / count
  }
})

// ========================================
// VALIDATION
// ========================================
const validateField = (field) => {
  if (field === 'ph') {
    const val = parseFloat(form.value.ph)
    if (!form.value.ph) {
      errors.value.ph = 'pH wajib diisi'
    } else if (val < 0 || val > 14) {
      errors.value.ph = 'pH harus 0 - 14'
    } else {
      errors.value.ph = ''
    }
  }
  
  if (field === 'suhu') {
    const val = parseFloat(form.value.suhu)
    if (!form.value.suhu) {
      errors.value.suhu = 'Suhu wajib diisi'
    } else if (val < 0 || val > 50) {
      errors.value.suhu = 'Suhu harus 0 - 50°C'
    } else {
      errors.value.suhu = ''
    }
  }
  
  if (field === 'oksigen') {
    const val = parseFloat(form.value.oksigen)
    if (!form.value.oksigen) {
      errors.value.oksigen = 'Oksigen wajib diisi'
    } else if (val < 0 || val > 20) {
      errors.value.oksigen = 'Oksigen harus 0 - 20 mg/L'
    } else {
      errors.value.oksigen = ''
    }
  }
}

const getPhStatus = (value) => {
  const val = parseFloat(value)
  if (!value) return ''
  if (val >= 6.5 && val <= 8.5) return 'good'
  if ((val >= 6.0 && val < 6.5) || (val > 8.5 && val <= 9.0)) return 'warning'
  return 'danger'
}

const getSuhuStatus = (value) => {
  const val = parseFloat(value)
  if (!value) return ''
  if (val >= 26 && val <= 32) return 'good'
  if ((val >= 24 && val < 26) || (val > 32 && val <= 34)) return 'warning'
  return 'danger'
}

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
    ph: '',
    suhu: '',
    salinitas: '',
    oksigen: '',
    kecerahan: '',
    catatan: ''
  }
  errors.value = {
    tambak_id: '',
    ph: '',
    suhu: '',
    oksigen: ''
  }
  showForm.value = false
}

const onTambakChange = () => {
  errors.value.tambak_id = ''
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

const fetchMonitoring = async () => {
  const id = selectedTambak.value
  if (!id) {
    monitorings.value = []
    return
  }

  try {
    loading.value = true
    const res = await monitoringApi.getByTambak(id)
    monitorings.value = res.data || []
  } catch (err) {
    console.error('Error fetching monitoring:', err)
    monitorings.value = []
  } finally {
    loading.value = false
  }
}

const saveMonitoring = async () => {
  // Validasi
  let isValid = true
  errors.value = { tambak_id: '', ph: '', suhu: '', oksigen: '' }

  if (!form.value.tambak_id) {
    errors.value.tambak_id = 'Pilih tambak terlebih dahulu'
    isValid = false
  }
  
  if (!form.value.ph) {
    errors.value.ph = 'pH wajib diisi'
    isValid = false
  }
  
  if (!form.value.suhu) {
    errors.value.suhu = 'Suhu wajib diisi'
    isValid = false
  }
  
  if (!form.value.oksigen) {
    errors.value.oksigen = 'Oksigen wajib diisi'
    isValid = false
  }

  if (!isValid) return

  try {
    loading.value = true
    await monitoringApi.create(form.value)
    selectedTambak.value = form.value.tambak_id
    resetForm()
    await fetchMonitoring()
  } catch (err) {
    console.error('Error saving monitoring:', err)
    const message = err.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const deleteMonitoring = async (id) => {
  if (!confirm('⚠️ Yakin ingin menghapus data monitoring ini?')) return

  try {
    loading.value = true
    await monitoringApi.delete(id)
    await fetchMonitoring()
  } catch (err) {
    console.error('Error deleting monitoring:', err)
    const message = err.response?.data?.message || 'Gagal menghapus data. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
  fetchTambak()
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

.btn-refresh {
  width: 100%;
  justify-content: center;
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

.field-hint {
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.field-hint.good {
  color: #2ecc71;
}

.field-hint.warning {
  color: #f39c12;
}

.field-hint.danger {
  color: #e74c3c;
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
   FILTER CARD
   ======================================== */
.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 0.8fr;
  gap: 16px;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #1a1a2e;
}

.filter-select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: #1B6CA8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 108, 168, 0.1);
}

/* ========================================
   STATUS SUMMARY
   ======================================== */
.status-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.status-item {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  text-align: center;
}

.status-label {
  display: block;
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 4px;
}

.status-value {
  font-size: 22px;
  font-weight: 700;
  color: #1B6CA8;
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
   VALUE BADGE
   ======================================== */
.value-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
}

.value-badge.good {
  background: #d4edda;
  color: #155724;
}

.value-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.value-badge.danger {
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
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

  .filter-grid {
    grid-template-columns: 1fr 1fr;
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

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .status-summary {
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
}

@media (max-width: 480px) {
  .card {
    padding: 16px;
  }

  .status-summary {
    grid-template-columns: 1fr;
  }

  .table th,
  .table td {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>