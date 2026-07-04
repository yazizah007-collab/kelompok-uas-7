<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h2>🐟 Produk Saya</h2>
          <p class="text-gray-500 text-sm">Kelola semua produk hasil laut Anda</p>
        </div>
        <button class="btn btn-primary" @click="toggleForm">
          {{ showForm ? '✕ Batal' : '+ Tambah Produk' }}
        </button>
      </div>

      <!-- Form Tambah/Edit Produk -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-6"
      >
        <div class="card form-card" v-if="showForm">
          <h3>{{ editId ? '✏️ Edit Produk' : '📝 Tambah Produk Baru' }}</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label>📌 Nama Produk <span class="required">*</span></label>
              <input 
                v-model="form.nama_produk" 
                placeholder="Masukkan nama produk"
                :class="{ 'input-error': errors.nama_produk }"
                @blur="validateField('nama_produk')"
              />
              <span v-if="errors.nama_produk" class="error-text">{{ errors.nama_produk }}</span>
            </div>

            <div class="form-group">
              <label>📂 Kategori <span class="required">*</span></label>
              <select v-model="form.kategori_id" :class="{ 'input-error': errors.kategori_id }">
                <option value="">-- Pilih Kategori --</option>
                <option v-for="k in kategoris" :key="k.id" :value="k.id">
                  {{ k.nama_kategori || k.nama }}
                </option>
              </select>
              <span v-if="errors.kategori_id" class="error-text">{{ errors.kategori_id }}</span>
            </div>

            <div class="form-group">
              <label>💰 Harga (Rp) <span class="required">*</span></label>
              <input 
                v-model="form.harga" 
                type="number" 
                placeholder="0"
                :class="{ 'input-error': errors.harga }"
                @blur="validateField('harga')"
              />
              <span v-if="errors.harga" class="error-text">{{ errors.harga }}</span>
            </div>

            <div class="form-group">
              <label>📦 Stok <span class="required">*</span></label>
              <input 
                v-model="form.stok" 
                type="number" 
                placeholder="0"
                :class="{ 'input-error': errors.stok }"
                @blur="validateField('stok')"
              />
              <span v-if="errors.stok" class="error-text">{{ errors.stok }}</span>
            </div>

            <div class="form-group">
              <label>⚖️ Satuan <span class="required">*</span></label>
              <select v-model="form.satuan" :class="{ 'input-error': errors.satuan }">
                <option value="">-- Pilih Satuan --</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="ekor">Ekor</option>
                <option value="ikat">Ikat</option>
                <option value="pcs">Pcs</option>
                <option value="liter">Liter</option>
              </select>
              <span v-if="errors.satuan" class="error-text">{{ errors.satuan }}</span>
            </div>

            <div class="form-group">
              <label>📊 Status</label>
              <select v-model="form.status">
                <option value="tersedia">✅ Tersedia</option>
                <option value="habis">❌ Habis</option>
                <option value="preorder">📅 Pre-Order</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>📝 Deskripsi</label>
              <textarea 
                v-model="form.deskripsi" 
                rows="3" 
                placeholder="Deskripsikan produk Anda (cara budidaya, kualitas, dll.)"
              ></textarea>
            </div>

            <div class="form-group full-width">
              <label>🖼️ Gambar Produk (URL)</label>
              <input 
                v-model="form.gambar" 
                placeholder="https://example.com/gambar-produk.jpg (opsional)"
              />
              <div v-if="form.gambar" class="image-preview">
                <img :src="form.gambar" alt="Preview" @error="handleImageError" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="saveProduk" :disabled="loading">
              {{ loading ? '⏳ Menyimpan...' : editId ? '💾 Update Produk' : '💾 Simpan Produk' }}
            </button>
            <button class="btn btn-outline" @click="resetForm">
              🔄 Reset
            </button>
          </div>
        </div>
      </transition>

      <!-- Filter & Search -->
      <div class="card filter-card">
        <div class="filter-grid">
          <div class="filter-group">
            <label>🔍 Cari Produk</label>
            <input 
              v-model="searchQuery" 
              placeholder="Cari nama produk..."
              class="search-input"
            />
          </div>
          <div class="filter-group">
            <label>📂 Filter Kategori</label>
            <select v-model="filterKategori" class="filter-select">
              <option value="">Semua Kategori</option>
              <option v-for="k in kategoris" :key="k.id" :value="k.id">
                {{ k.nama_kategori || k.nama }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>📊 Filter Status</label>
            <select v-model="filterStatus" class="filter-select">
              <option value="">Semua Status</option>
              <option value="tersedia">✅ Tersedia</option>
              <option value="habis">❌ Habis</option>
              <option value="preorder">📅 Pre-Order</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistik Produk -->
      <div class="stats" v-if="produks.length > 0">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            🐟
          </div>
          <div>
            <p class="stat-label">Total Produk</p>
            <h3>{{ produks.length }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            ✅
          </div>
          <div>
            <p class="stat-label">Tersedia</p>
            <h3>{{ produkTersedia }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-red-100 text-red-600">
            ❌
          </div>
          <div>
            <p class="stat-label">Habis</p>
            <h3>{{ produkHabis }}</h3>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-100 text-orange-600">
            📅
          </div>
          <div>
            <p class="stat-label">Pre-Order</p>
            <h3>{{ produkPreorder }}</h3>
          </div>
        </div>
      </div>

      <!-- Tabel Produk -->
      <div class="card table-card">
        <div class="table-header">
          <h3>📋 Daftar Produk</h3>
          <span class="data-count" v-if="filteredProduks.length > 0">
            {{ filteredProduks.length }} produk
          </span>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat produk...</p>
        </div>

        <div v-else-if="filteredProduks.length === 0" class="empty-state">
          <p class="empty-icon">🐟</p>
          <p class="empty-text">Belum ada produk</p>
          <p class="empty-subtext">
            {{ searchQuery || filterKategori || filterStatus ? 'Tidak ada produk dengan filter ini' : 'Mulai tambahkan produk hasil laut Anda' }}
          </p>
          <button v-if="!searchQuery && !filterKategori && !filterStatus" class="btn btn-primary" @click="showForm = true">
            + Tambah Produk
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>🖼️ Gambar</th>
                <th>📌 Nama Produk</th>
                <th>📂 Kategori</th>
                <th>💰 Harga</th>
                <th>📦 Stok</th>
                <th>⚖️ Satuan</th>
                <th>📊 Status</th>
                <th>⚡ Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in filteredProduks" :key="p.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <img 
                    :src="p.gambar || '/product-placeholder.png'" 
                    :alt="p.nama_produk"
                    class="product-thumb"
                    @error="handleProductImageError"
                  />
                </td>
                <td class="product-name">{{ p.nama_produk }}</td>
                <td>
                  <span class="category-badge">{{ getKategoriNama(p.kategori_id) }}</span>
                </td>
                <td class="price-cell">Rp {{ p.harga.toLocaleString('id-ID') }}</td>
                <td>
                  <span :class="['stock-badge', p.stok > 0 ? 'stock-available' : 'stock-empty']">
                    {{ p.stok }}
                  </span>
                </td>
                <td>{{ p.satuan || '-' }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(p.status)]">
                    {{ getStatusLabel(p.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action btn-edit" 
                      @click="editProduk(p)"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      class="btn-action btn-delete" 
                      @click="deleteProduk(p.id)"
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
        <div v-if="filteredProduks.length > 0" class="table-footer">
          <span class="text-sm text-gray-500">
            Menampilkan {{ filteredProduks.length }} dari {{ produks.length }} produk
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { produkApi } from '../../api'

// ========================================
// STATE
// ========================================
const produks = ref([])
const kategoris = ref([])
const showForm = ref(false)
const editId = ref(null)
const loading = ref(false)
const searchQuery = ref('')
const filterKategori = ref('')
const filterStatus = ref('')

const form = ref({
  nama_produk: '',
  kategori_id: '',
  harga: '',
  stok: '',
  satuan: '',
  deskripsi: '',
  status: 'tersedia',
  gambar: ''
})

const errors = ref({
  nama_produk: '',
  kategori_id: '',
  harga: '',
  stok: '',
  satuan: ''
})

// ========================================
// COMPUTED
// ========================================
const filteredProduks = computed(() => {
  let filtered = [...produks.value]

  // Search by name
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.nama_produk.toLowerCase().includes(query)
    )
  }

  // Filter by kategori
  if (filterKategori.value) {
    filtered = filtered.filter(p => p.kategori_id === filterKategori.value)
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(p => p.status === filterStatus.value)
  }

  return filtered
})

const produkTersedia = computed(() => {
  return produks.value.filter(p => p.status === 'tersedia').length
})

const produkHabis = computed(() => {
  return produks.value.filter(p => p.status === 'habis').length
})

const produkPreorder = computed(() => {
  return produks.value.filter(p => p.status === 'preorder').length
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
    nama_produk: '',
    kategori_id: '',
    harga: '',
    stok: '',
    satuan: '',
    deskripsi: '',
    status: 'tersedia',
    gambar: ''
  }
  editId.value = null
  errors.value = { nama_produk: '', kategori_id: '', harga: '', stok: '', satuan: '' }
  showForm.value = false
}

const validateField = (field) => {
  if (field === 'nama_produk') {
    if (!form.value.nama_produk.trim()) {
      errors.value.nama_produk = 'Nama produk wajib diisi'
    } else {
      errors.value.nama_produk = ''
    }
  }
  
  if (field === 'kategori_id') {
    if (!form.value.kategori_id) {
      errors.value.kategori_id = 'Pilih kategori'
    } else {
      errors.value.kategori_id = ''
    }
  }
  
  if (field === 'harga') {
    const val = parseFloat(form.value.harga)
    if (!form.value.harga) {
      errors.value.harga = 'Harga wajib diisi'
    } else if (val <= 0) {
      errors.value.harga = 'Harga harus lebih dari 0'
    } else {
      errors.value.harga = ''
    }
  }
  
  if (field === 'stok') {
    const val = parseInt(form.value.stok)
    if (form.value.stok === '' || form.value.stok === null) {
      errors.value.stok = 'Stok wajib diisi'
    } else if (val < 0) {
      errors.value.stok = 'Stok tidak boleh negatif'
    } else {
      errors.value.stok = ''
    }
  }
  
  if (field === 'satuan') {
    if (!form.value.satuan) {
      errors.value.satuan = 'Pilih satuan'
    } else {
      errors.value.satuan = ''
    }
  }
}

const getKategoriNama = (id) => {
  const kategori = kategoris.value.find(k => k.id === id)
  return kategori?.nama_kategori || kategori?.nama || '-'
}

const getStatusClass = (status) => {
  const map = {
    'tersedia': 'status-tersedia',
    'habis': 'status-habis',
    'preorder': 'status-preorder'
  }
  return map[status] || 'status-tersedia'
}

const getStatusLabel = (status) => {
  const map = {
    'tersedia': '✅ Tersedia',
    'habis': '❌ Habis',
    'preorder': '📅 Pre-Order'
  }
  return map[status] || status || 'Tersedia'
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const handleProductImageError = (e) => {
  e.target.src = '/product-placeholder.png'
}

const fetchProduk = async () => {
  try {
    loading.value = true
    const res = await produkApi.getMyProducts()
    produks.value = res.data || []
  } catch (err) {
    console.error('Error fetching produk:', err)
    produks.value = []
  } finally {
    loading.value = false
  }
}

const fetchKategori = async () => {
  try {
    const res = await produkApi.getKategoris()
    kategoris.value = res.data || []
  } catch (err) {
    console.error('Error fetching kategori:', err)
    kategoris.value = []
  }
}

const saveProduk = async () => {
  // Validate all fields
  validateField('nama_produk')
  validateField('kategori_id')
  validateField('harga')
  validateField('stok')
  validateField('satuan')
  
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
      harga: parseFloat(form.value.harga),
      stok: parseInt(form.value.stok)
    }

    if (editId.value) {
      await produkApi.update(editId.value, payload)
    } else {
      await produkApi.create(payload)
    }

    resetForm()
    await fetchProduk()
  } catch (err) {
    console.error('Error saving produk:', err)
    const message = err.response?.data?.message || 'Gagal menyimpan produk. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

const editProduk = (produk) => {
  editId.value = produk.id
  form.value = {
    nama_produk: produk.nama_produk || '',
    kategori_id: produk.kategori_id || '',
    harga: produk.harga || '',
    stok: produk.stok || '',
    satuan: produk.satuan || '',
    deskripsi: produk.deskripsi || '',
    status: produk.status || 'tersedia',
    gambar: produk.gambar || ''
  }
  errors.value = { nama_produk: '', kategori_id: '', harga: '', stok: '', satuan: '' }
  showForm.value = true
}

const deleteProduk = async (id) => {
  if (!confirm('⚠️ Yakin ingin menghapus produk ini?')) return

  try {
    loading.value = true
    await produkApi.delete(id)
    await fetchProduk()
  } catch (err) {
    console.error('Error deleting produk:', err)
    const message = err.response?.data?.message || 'Gagal menghapus produk. Silakan coba lagi.'
    alert(message)
  } finally {
    loading.value = false
  }
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
  fetchProduk()
  fetchKategori()
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

.image-preview {
  margin-top: 8px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-width: 150px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
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

.search-input,
.filter-select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.search-input:focus,
.filter-select:focus {
  border-color: #1B6CA8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 108, 168, 0.1);
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

.product-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.product-name {
  font-weight: 500;
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
  background: #e8f4fd;
  color: #1B6CA8;
}

/* ========================================
   STOCK BADGE
   ======================================== */
.stock-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.stock-available {
  background: #d4edda;
  color: #155724;
}

.stock-empty {
  background: #f8d7da;
  color: #721c24;
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

.status-tersedia {
  background: #d4edda;
  color: #155724;
}

.status-habis {
  background: #f8d7da;
  color: #721c24;
}

.status-preorder {
  background: #cce5ff;
  color: #004085;
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
    grid-template-columns: repeat(2, 1fr);
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
    grid-template-columns: 1fr 1fr;
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

  .product-thumb {
    width: 36px;
    height: 36px;
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

  .product-thumb {
    width: 32px;
    height: 32px;
  }
}
</style>