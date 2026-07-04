<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h2>💰 Pengeluaran Tambak</h2>
          <p class="text-gray-500 text-sm">Kelola semua pengeluaran operasional tambak Anda</p>
        </div>
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? '✕ Batal' : '+ Tambah Pengeluaran' }}
        </button>
      </div>

      <!-- Form Tambah Pengeluaran -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-6"
      >
        <div class="card form-card" v-if="showForm">
          <h3>📝 {{ editId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru' }}</h3>
          
          <div class="form-grid">
            <div class="form-group">
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
              <label>📂 Kategori <span class="required">*</span></label>
              <select v-model="form.kategori" :class="{ 'input-error': errors.kategori }">
                <option value="">-- Pilih Kategori --</option>
                <option value="Pakan">🌾 Pakan</option>
                <option value="Obat">💊 Obat</option>
                <option value="Listrik">⚡ Listrik</option>
                <option value="Tenaga Kerja">👨‍🌾 Tenaga Kerja</option>
                <option value="Peralatan">🔧 Peralatan</option>
                <option value="Transportasi">🚚 Transportasi</option>
                <option value="Lainnya">📌 Lainnya</option>
              </select>
              <span v-if="errors.kategori" class="error-text">{{ errors.kategori }}</span>
            </div>

            <div class="form-group">
              <label>💰 Jumlah (Rp) <span class="required">*</span></label>
              <input 
                v-model="form.jumlah" 
                type="number" 
                placeholder="0"
                :class="{ 'input-error': errors.jumlah }"
                @blur="validateField('jumlah')"
              />
              <span v-if="errors.jumlah" class="error-text">{{ errors.jumlah }}</span>
            </div>

            <div class="form-group">
              <label>📅 Tanggal <span class="required">*</span></label>
              <input 
                v-model="form.tanggal" 
                type="date"
                :class="{ 'input-error': errors.tanggal }"
              />
              <span v-if="errors.tanggal" class="error-text">{{ errors.tanggal }}</span>
            </div>

            <div class="form-group full-width">
              <label>📝 Keterangan</label>
              <input 
                v-model="form.keterangan" 
                placeholder="Deskripsi pengeluaran (opsional)"
              />
            </div>

            <div class="form-group full-width">
              <label>📎 Bukti (URL)</label>
              <input 
                v-model="form.bukti" 
                placeholder="https://example.com/bukti.jpg (opsional)"
              />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="savePengeluaran" :disabled="loading">
              {{ loading ? '⏳ Menyimpan...' : editId ? '💾 Update' : '💾 Simpan' }}
            </button>
            <button class="btn btn-outline" @click="resetForm">
              🔄 Reset
            </button>
          </div>
        </div>
      </transition>

      <!-- Ringkasan & Filter -->
      <div class="summary-section">
        <div class="stats">
          <div class="stat-card">
            <div class="stat-icon bg-blue-100 text-blue-600">
              💰
            </div>
            <div>
              <p class="stat-label">Total Pengeluaran</p>
              <h3>Rp {{ totalPengeluaran.toLocaleString('id-ID') }}</h3>
              <span class="stat-change">{{ pengeluarans.length }} transaksi</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-green-100 text-green-600">
              📊
            </div>
            <div>
              <p class="stat-label">Rata-rata per Bulan</p>
              <h3>Rp {{ averageMonthly.toLocaleString('id-ID') }}</h3>
              <span class="stat-change">{{ currentMonth }} bulan ini</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-orange-100 text-orange-600">
              📂
            </div>
            <div>
              <p class="stat-label">Kategori Terbanyak</p>
              <h3>{{ topCategory || '-' }}</h3>
              <span class="stat-change">{{ topCategoryCount }} transaksi</span>
            </div>
          </div>
        </div>

        <!-- Filter -->
        <div class="card filter-card">
          <div class="filter-grid">
            <div class="filter-group">
              <label>🌾 Filter Tambak</label>
              <select v-model="filterTambak" class="filter-select">
                <option value="">Semua Tambak</option>
                <option v-for="t in tambaks" :key="t.id" :value="t.id">
                  {{ t.nama_tambak || t.nama }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>📂 Filter Kategori</label>
              <select v-model="filterKategori" class="filter-select">
                <option value="">Semua Kategori</option>
                <option value="Pakan">🌾 Pakan</option>
                <option value="Obat">💊 Obat</option>
                <option value="Listrik">⚡ Listrik</option>
                <option value="Tenaga Kerja">👨‍🌾 Tenaga Kerja</option>
                <option value="Peralatan">🔧 Peralatan</option>
                <option value="Transportasi">🚚 Transportasi</option>
                <option value="Lainnya">📌 Lainnya</option>
              </select>
            </div>
            <div class="filter-group">
              <label>📅 Periode</label>
              <select v-model="filterPeriode" class="filter-select">
                <option value="all">Semua Waktu</option>
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
                <option value="90">90 Hari Terakhir</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabel Pengeluaran -->
      <div class="card table-card">
        <div class="table-header">
          <h3>📋 Daftar Pengeluaran</h3>
          <span class="data-count" v-if="filteredPengeluarans.length > 0">
            {{ filteredPengeluarans.length }} data
          </span>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat data pengeluaran...</p>
        </div>

        <div v-else-if="filteredPengeluarans.length === 0" class="empty-state">
          <p class="empty-icon">💰</p>
          <p class="empty-text">Belum ada pengeluaran</p>
          <p class="empty-subtext">
            {{ filterTambak || filterKategori ? 'Tidak ada pengeluaran dengan filter ini' : 'Mulai catat pengeluaran tambak Anda' }}
          </p>
          <button v-if="!filterTambak && !filterKategori" class="btn btn-primary" @click="showForm = true">
            + Tambah Pengeluaran
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>🌾 Tambak</th>
                <th>📂 Kategori</th>
                <th>💰 Jumlah</th>
                <th>📅 Tanggal</th>
                <th>📝 Keterangan</th>
                <th>⚡ Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in filteredPengeluarans" :key="p.id">
                <td>{{ index + 1 }}</td>
                <td>{{ getNamaTambak(p.tambak_id) }}</td>
                <td>
                  <span :class="['category-badge', getCategoryClass(p.kategori)]">
                    {{ getCategoryIcon(p.kategori) }} {{ p.kategori }}
                  </span>
                </td>
                <td class="price-cell">Rp {{ p.jumlah.toLocaleString('id-ID') }}</td>
                <td>{{ formatDate(p.tanggal) }}</td>
                <td>{{ p.keterangan || '-' }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit" 
                      @click="editPengeluaran(p)"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      class="btn-action btn-delete" 
                      @click="deletePengeluaran(p.id)"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div v-if="filteredPengeluarans.length > 0" class="table-footer">
          <span class="text-sm text-gray-500">
            Total: Rp {{ filteredTotal.toLocaleString('id-ID') }}
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

// ========================================
// STATE
// ========================================
const tambaks = ref([])
const pengeluarans = ref([])
const showForm = ref(false)
const editId = ref(null)
const loading = ref(false)
const filterTambak = ref('')
const filterKategori = ref('')
const filterPeriode = ref('all')

const form = ref({
  tambak_id: '',
  kategori: '',
  jumlah: '',
  tanggal: '',
  keterangan: '',
  bukti: ''
})

const errors = ref({
  tambak_id: '',
  kategori: '',
  jumlah: '',
  tanggal: ''
})

// ========================================
// COMPUTED
// ========================================
const currentMonth = computed(() => {
  return new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })
})

const filteredPengeluarans = computed(() => {
  let filtered = [...pengeluarans.value]

  // Filter by tambak
  if (filterTambak.value) {
    filtered = filtered.filter(p => p.tambak_id === filterTambak.value)
  }

  // Filter by kategori
  if (filterKategori.value) {
    filtered = filtered.filter(p => p.kategori === filterKategori.value)
  }

  // Filter by periode
  if (filterPeriode.value !== 'all') {
    const days = parseInt(filterPeriode.value)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    filtered = filtered.filter(p => new Date(p.tanggal) >= cutoffDate)
  }

  // Sort by date descending
  return filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
})

const totalPengeluaran = computed(() => {
  return pengeluarans.value.reduce((sum, p) => sum + (p.jumlah || 0), 0)
})

const filteredTotal = computed(() => {
  return filteredPengeluarans.value.reduce((sum, p) => sum + (p.jumlah || 0), 0)
})

const averageMonthly = computed(() => {
  if (pengeluarans.value.length === 0) return 0
  
  // Get unique months
  const months = new Set()
  pengeluarans.value.forEach(p => {
    const date = new Date(p.tanggal)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    months.add(monthKey)
  })
  
  const monthCount = months.size || 1
  return totalPengeluaran.value / monthCount
})

const topCategory = computed(() => {
  if (pengeluarans.value.length === 0) return '-'
  
  const categoryCount = {}
  pengeluarans.value.forEach(p => {
    categoryCount[p.kategori] = (categoryCount[p.kategori] || 0) + 1
  })
  
  let maxCount = 0
  let maxCategory = '-'
  for (const [category, count] of Object.entries(categoryCount)) {
    if (count > maxCount) {
      maxCount = count
      maxCategory = category
    }
  }
  return maxCategory
})

const topCategoryCount = computed(() => {
  if (topCategory === '-') return 0
  return pengeluarans.value.filter(p => p.kategori === topCategory).length
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
    kategori: '',
    jumlah: '',
    tanggal: '',
    keterangan: '',
    bukti: ''
  }
  editId.value = null
  errors.value = { tambak_id: '', kategori: '', jumlah: '', tanggal: '' }
  showForm.value = false
}

const validateField = (field) => {
  if (field === 'jumlah') {
    const val = parseFloat(form.value.jumlah)
    if (!form.value.jumlah) {
      errors.value.jumlah = 'Jumlah wajib diisi'
    } else if (val <= 0) {
      errors.value.jumlah = 'Jumlah harus lebih dari 0'
    } else {
      errors.value.jumlah = ''
    }
  }
}

const getCategoryIcon = (kategori) => {
  const map = {
    'Pakan': '🌾',
    'Obat': '💊',
    'Listrik': '⚡',
    'Tenaga Kerja': '👨‍🌾',
    'Peralatan': '🔧',
    'Transportasi': '🚚',
    'Lainnya': '📌'
  }
  return map[kategori] || '📌'
}

const getCategoryClass = (kategori) => {
  const map = {
    'Pakan': 'category-pakan',
    'Obat': 'category-obat',
    'Listrik': 'category-listrik',
    'Tenaga Kerja': 'category-tenaga',
    'Peralatan': 'category-peralatan',
    'Transportasi': 'category-transport',
    'Lainnya': 'category-lainnya'
  }
  return map[kategori] || 'category-lainnya'
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

const fetchTambak = async () => {
  try {
    const res = await tambakApi.getAll()
    tambaks.value = res.data || []
  } catch (err) {
    console.error('Error fetching tambak:', err)
    tambaks.value = []
  }
}

const fetchAllPengeluaran = async () => {
  try {
    loading.value = true
    const all = []
    for (const t of tambaks.value) {
      try {
        const res = await tambakApi.getPengeluaran(t.id)
        if (res.data && Array.isArray(res.data)) {
          all.push(...res.data)
        }
      } catch (err) {
        console.error(`Error fetching pengeluaran for tambak ${t.id}:`, err)
      }
    }
    pengeluarans.value = all
  } catch (err) {
    console.error('Error fetching pengeluaran:', err)
    pengeluarans.value = []
  } finally {
    loading.value = false
  }
}

const savePengeluaran = async () => {
  // Validate
  let isValid = true
  errors.value = { tambak_id: '', kategori: '', jumlah: '', tanggal: '' }

  if (!form.value.tambak_id) {
    errors.value.tambak_id = 'Pilih tambak'
    isValid = false
  }
  if (!form.value.kategori) {
    errors.value.kategori = 'Pilih kategori'
    isValid = false
  }
  if (!form.value.jumlah || parseFloat(form.value.jumlah) <= 0) {
    errors.value.jumlah = 'Masukkan jumlah yang valid'
    isValid = false
  }
  if (!form.value.tanggal) {
    errors.value.tanggal = 'Pilih tanggal'
    isValid = false
  }

  if (!isValid) return

  try {
    loading.value = true
    const payload = {
      ...form.value,
      jumlah: parseFloat(form.value.jumlah)
    }

    if (editId.value) {
      await tambakApi.updatePengeluaran(editId.value, payload)
    } else {
      await tambakApi.addPengeluaran(form.value.tambak_id, payload)
    }

    resetForm()
    await fetchAllPengeluaran()
  } catch (err) {
    console.error('Error saving pengeluaran:', err)
    const message = err.response?.data?.message || 'Gagal menyimpan pengeluaran. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const editPengeluaran = (pengeluaran) => {
  editId.value = pengeluaran.id
  form.value = {
    tambak_id: pengeluaran.tambak_id,
    kategori: pengeluaran.kategori,
    jumlah: pengeluaran.jumlah,
    tanggal: pengeluaran.tanggal,
    keterangan: pengeluaran.keterangan || '',
    bukti: pengeluaran.bukti || ''
  }
  errors.value = { tambak_id: '', kategori: '', jumlah: '', tanggal: '' }
  showForm.value = true
}

const deletePengeluaran = async (id) => {
  if (!confirm('⚠️ Yakin ingin menghapus pengeluaran ini?')) return

  try {
    loading.value = true
    await tambakApi.deletePengeluaran(id)
    await fetchAllPengeluaran()
  } catch (err) {
    console.error('Error deleting pengeluaran:', err)
    const message = err.response?.data?.message || 'Gagal menghapus pengeluaran. Silakan coba lagi.'
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
  await fetchAllPengeluaran()
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
  grid-column: 1 / -1;
}

/* ========================================
   STATS
   ======================================== */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
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
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.stat-change {
  font-size: 12px;
  color: #6c757d;
  display: block;
  margin-top: 2px;
}

/* ========================================
   FILTER
   ======================================== */
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

.price-cell {
  font-weight: 600;
  color: #1B6CA8;
}

/* ========================================
   CATEGORY BADGE
   ======================================== */
.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.category-pakan {
  background: #d4edda;
  color: #155724;
}

.category-obat {
  background: #cce5ff;
  color: #004085;
}

.category-listrik {
  background: #fff3cd;
  color: #856404;
}

.category-tenaga {
  background: #f8d7da;
  color: #721c24;
}

.category-peralatan {
  background: #d1ecf1;
  color: #0c5460;
}

.category-transport {
  background: #e8daef;
  color: #6c3483;
}

.category-lainnya {
  background: #e2e3e5;
  color: #383d41;
}

/* ========================================
   ACTION BUTTONS
   ======================================== */
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

/* ========================================
   TABLE FOOTER
   ======================================== */
.table-footer {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 2px solid #f0f8ff;
  display: flex;
  justify-content: flex-end;
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

  .stats {
    grid-template-columns: 1fr 1fr;
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

  .stats {
    grid-template-columns: 1fr;
  }

  .filter-grid {
    grid-template-columns: 1fr;
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