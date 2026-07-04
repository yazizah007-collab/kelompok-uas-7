<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h2>📰 Manajemen Artikel</h2>
          <p class="text-gray-500 text-sm">Kelola semua artikel di platform LautKu</p>
        </div>
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? '✕ Batal' : '+ Tambah Artikel' }}
        </button>
      </div>

      <!-- Form Tambah/Edit Artikel -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-6"
      >
        <div class="card form-card" v-if="showForm">
          <h3>{{ editId ? '✏️ Edit Artikel' : '📝 Tambah Artikel Baru' }}</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label>📌 Judul Artikel <span class="required">*</span></label>
              <input 
                v-model="form.judul" 
                placeholder="Masukkan judul artikel..."
                :class="{ 'input-error': errors.judul }"
                @blur="validateField('judul')"
              />
              <span v-if="errors.judul" class="error-text">{{ errors.judul }}</span>
            </div>

            <div class="form-group">
              <label>📂 Kategori <span class="required">*</span></label>
              <select v-model="form.kategori" :class="{ 'input-error': errors.kategori }">
                <option value="">Pilih Kategori</option>
                <option value="Budidaya">🌱 Budidaya</option>
                <option value="Pemasaran">📊 Pemasaran</option>
                <option value="Teknologi">💻 Teknologi</option>
                <option value="Lingkungan">🌍 Lingkungan</option>
                <option value="Resep">🍳 Resep Masakan</option>
                <option value="Berita">📰 Berita</option>
              </select>
              <span v-if="errors.kategori" class="error-text">{{ errors.kategori }}</span>
            </div>

            <div class="form-group full-width">
              <label>📝 Konten <span class="required">*</span></label>
              <textarea 
                v-model="form.konten" 
                rows="8" 
                placeholder="Tulis konten artikel di sini..."
                :class="{ 'input-error': errors.konten }"
                @blur="validateField('konten')"
              ></textarea>
              <span v-if="errors.konten" class="error-text">{{ errors.konten }}</span>
            </div>

            <div class="form-group">
              <label>📷 Gambar (URL)</label>
              <input 
                v-model="form.gambar" 
                placeholder="https://example.com/gambar.jpg"
              />
            </div>

            <div class="form-group">
              <label>📅 Status</label>
              <select v-model="form.status">
                <option value="draft">📄 Draft</option>
                <option value="publish">🚀 Publish</option>
                <option value="archive">📦 Archive</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="saveArtikel" :disabled="loading">
              {{ loading ? '⏳ Menyimpan...' : editId ? '💾 Update Artikel' : '💾 Simpan Artikel' }}
            </button>
            <button class="btn btn-outline" @click="resetForm">
              🔄 Reset
            </button>
          </div>
        </div>
      </transition>

      <!-- Tabel Artikel -->
      <div class="card table-card">
        <div class="table-header">
          <h3>📋 Daftar Artikel</h3>
          <div class="table-controls">
            <input 
              v-model="searchQuery" 
              placeholder="🔍 Cari artikel..." 
              class="search-input"
            />
            <select v-model="filterStatus" class="filter-select">
              <option value="">Semua Status</option>
              <option value="publish">🚀 Publish</option>
              <option value="draft">📄 Draft</option>
              <option value="archive">📦 Archive</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat artikel...</p>
        </div>

        <div v-else-if="filteredArtikels.length === 0" class="text-center py-8">
          <p class="text-gray-500 text-lg">📭 Tidak ada artikel ditemukan</p>
          <p class="text-gray-400 text-sm">Tambahkan artikel baru atau ubah filter pencarian</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>📌 Judul</th>
                <th>📂 Kategori</th>
                <th>📅 Tanggal</th>
                <th>📊 Status</th>
                <th>⚡ Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(artikel, index) in filteredArtikels" :key="artikel.id">
                <td>{{ index + 1 }}</td>
                <td class="title-cell">
                  <span class="title-text">{{ artikel.judul }}</span>
                  <span v-if="artikel.gambar" class="has-image">🖼️</span>
                </td>
                <td>
                  <span class="category-badge">{{ artikel.kategori || 'Umum' }}</span>
                </td>
                <td>{{ formatDate(artikel.createdAt || artikel.created_at) }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(artikel.status)]">
                    {{ getStatusLabel(artikel.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action btn-edit" @click="editArtikel(artikel)" title="Edit">
                      ✏️
                    </button>
                    <button class="btn-action btn-delete" @click="deleteArtikel(artikel.id)" title="Hapus">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredArtikels.length > 0" class="table-footer">
          <span class="text-sm text-gray-500">
            Menampilkan {{ filteredArtikels.length }} dari {{ artikels.length }} artikel
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { artikelApi } from '../../api'

// ========================================
// STATE
// ========================================
const artikels = ref([])
const showForm = ref(false)
const editId = ref(null)
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')

const form = ref({
  judul: '',
  kategori: '',
  konten: '',
  gambar: '',
  status: 'draft'
})

const errors = ref({
  judul: '',
  kategori: '',
  konten: ''
})

// ========================================
// COMPUTED
// ========================================
const filteredArtikels = computed(() => {
  let filtered = artikels.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.judul.toLowerCase().includes(query) ||
      (item.kategori && item.kategori.toLowerCase().includes(query))
    )
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  return filtered
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
    judul: '',
    kategori: '',
    konten: '',
    gambar: '',
    status: 'draft'
  }
  editId.value = null
  errors.value = { judul: '', kategori: '', konten: '' }
  showForm.value = false
}

const validateField = (field) => {
  if (field === 'judul') {
    if (!form.value.judul.trim()) {
      errors.value.judul = 'Judul wajib diisi'
    } else {
      errors.value.judul = ''
    }
  }
  
  if (field === 'kategori') {
    if (!form.value.kategori) {
      errors.value.kategori = 'Kategori wajib dipilih'
    } else {
      errors.value.kategori = ''
    }
  }
  
  if (field === 'konten') {
    if (!form.value.konten.trim()) {
      errors.value.konten = 'Konten wajib diisi'
    } else {
      errors.value.konten = ''
    }
  }
}

const validateForm = () => {
  validateField('judul')
  validateField('kategori')
  validateField('konten')
  
  return !errors.value.judul && !errors.value.kategori && !errors.value.konten
}

const fetchArtikel = async () => {
  try {
    loading.value = true
    const res = await artikelApi.getAdminArticles()
    artikels.value = res.data || []
  } catch (err) {
    console.error('Error fetching articles:', err)
    artikels.value = []
  } finally {
    loading.value = false
  }
}

const saveArtikel = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    if (editId.value) {
      await artikelApi.update(editId.value, form.value)
    } else {
      await artikelApi.create(form.value)
    }
    resetForm()
    await fetchArtikel()
  } catch (err) {
    console.error('Error saving article:', err)
    const message = err.response?.data?.message || 'Gagal menyimpan artikel. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const editArtikel = (artikel) => {
  editId.value = artikel.id
  form.value = {
    judul: artikel.judul || '',
    kategori: artikel.kategori || '',
    konten: artikel.konten || '',
    gambar: artikel.gambar || '',
    status: artikel.status || 'draft'
  }
  errors.value = { judul: '', kategori: '', konten: '' }
  showForm.value = true
}

const deleteArtikel = async (id) => {
  if (!confirm('⚠️ Yakin ingin menghapus artikel ini?')) return
  
  try {
    loading.value = true
    await artikelApi.delete(id)
    await fetchArtikel()
  } catch (err) {
    console.error('Error deleting article:', err)
    const message = err.response?.data?.message || 'Gagal menghapus artikel. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getStatusClass = (status) => {
  const map = {
    'publish': 'status-publish',
    'draft': 'status-draft',
    'archive': 'status-archive'
  }
  return map[status] || 'status-draft'
}

const getStatusLabel = (status) => {
  const map = {
    'publish': '🚀 Publish',
    'draft': '📄 Draft',
    'archive': '📦 Archive'
  }
  return map[status] || status || 'Draft'
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
  fetchArtikel()
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
   FORM CARD
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
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f0f8ff;
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
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f8ff;
}

.table-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  min-width: 200px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #1B6CA8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 108, 168, 0.1);
}

.filter-select {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: #1B6CA8;
  outline: none;
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

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-weight: 500;
}

.has-image {
  font-size: 16px;
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
  background: #e8f4fd;
  color: #1B6CA8;
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

.status-publish {
  background: #d4edda;
  color: #155724;
}

.status-draft {
  background: #fff3cd;
  color: #856404;
}

.status-archive {
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
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
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

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-controls {
    flex-direction: column;
  }

  .search-input {
    min-width: 100%;
  }

  .table th,
  .table td {
    padding: 8px 12px;
    font-size: 13px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
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
}
</style>