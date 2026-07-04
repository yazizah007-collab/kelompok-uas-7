<template>
  <div class="page-katalog">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1>🐟 Katalog Produk Laut</h1>
      <p>Temukan berbagai hasil laut segar dari nelayan terpercaya</p>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <input
          v-model="search"
          placeholder="🔍 Cari produk..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <select v-model="filterKategori" class="filter-select">
          <option value="">Semua Kategori</option>
          <option v-for="k in kategoris" :key="k.id" :value="k.id">
            {{ k.nama_kategori || k.nama }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="filterSort" class="filter-select">
          <option value="terbaru">🆕 Terbaru</option>
          <option value="termurah">💰 Termurah</option>
          <option value="termahal">💰 Termahal</option>
          <option value="terpopuler">⭐ Terpopuler</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat produk...</p>
    </div>

    <!-- Product Grid -->
    <div v-else-if="filteredProduk.length > 0" class="product-grid">
      <div
        class="product-card"
        v-for="p in filteredProduk"
        :key="p.id"
        @click="goToDetail(p.id)"
      >
        <div class="product-img">
          <img
            :src="p.gambar || '/product-placeholder.png'"
            :alt="p.nama_produk"
            @error="handleImageError"
          />
          <span class="product-status" :class="p.stok > 0 ? 'status-tersedia' : 'status-habis'">
            {{ p.stok > 0 ? '✅ Tersedia' : '❌ Habis' }}
          </span>
        </div>
        <div class="product-info">
          <h3>{{ p.nama_produk }}</h3>
          <p class="product-desc">{{ truncateText(p.deskripsi, 60) }}</p>
          <div class="product-footer">
            <span class="price">Rp {{ p.harga.toLocaleString('id-ID') }}</span>
            <span class="satuan">/ {{ p.satuan || 'kg' }}</span>
            <span class="stok">Stok: {{ p.stok || 0 }}</span>
          </div>
          <button
            v-if="canAddToCart"
            class="btn btn-primary w-full"
            :disabled="p.stok <= 0 || loadingCart"
            @click.stop="addToKeranjang(p)"
          >
            {{ loadingCart ? '⏳...' : p.stok > 0 ? '+ Keranjang' : '❌ Habis' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p class="empty-icon">🐟</p>
      <p class="empty-text">Tidak ada produk ditemukan</p>
      <p class="empty-subtext">Coba ubah filter pencarian atau reset filter</p>
      <button class="btn btn-outline" @click="resetFilters">Reset Filter</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { produkApi, orderApi } from '../../api'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const produks = ref([])
const kategoris = ref([])
const search = ref('')
const filterKategori = ref('')
const filterSort = ref('terbaru')
const jumlahKeranjang = ref(0)
const loading = ref(true)
const loadingCart = ref(false)

// Tombol "+ Keranjang" cuma untuk pembeli, atau tamu yang belum login
// (kalau belum login, klik tombol akan diarahkan ke halaman login)
const canAddToCart = computed(() => {
  return !authStore.isLoggedIn || authStore.role === 'pembeli'
})

const filteredProduk = computed(() => {
  let filtered = produks.value.filter(p => p.status === 'tersedia' || p.status === 'preorder')

  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.nama_produk.toLowerCase().includes(query) ||
      (p.deskripsi && p.deskripsi.toLowerCase().includes(query))
    )
  }

  if (filterKategori.value) {
    filtered = filtered.filter(p => p.kategori_id === filterKategori.value)
  }

  switch (filterSort.value) {
    case 'termurah':
      filtered.sort((a, b) => a.harga - b.harga)
      break
    case 'termahal':
      filtered.sort((a, b) => b.harga - a.harga)
      break
    case 'terpopuler':
      filtered.sort((a, b) => (b.terjual || 0) - (a.terjual || 0))
      break
    case 'terbaru':
    default:
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
  }

  return filtered
})

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const handleImageError = (e) => {
  e.target.src = '/product-placeholder.png'
}

const goToDetail = (id) => {
  router.push(`/katalog/${id}`)
}

const resetFilters = () => {
  search.value = ''
  filterKategori.value = ''
  filterSort.value = 'terbaru'
}

const fetchProduk = async () => {
  try {
    loading.value = true
    const res = await produkApi.getAll()
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
    kategoris.value = []
  }
}

const fetchKeranjang = async () => {
  try {
    if (!authStore.isLoggedIn || authStore.role !== 'pembeli') return
    const res = await orderApi.getKeranjang()
    const items = res.data || []
    jumlahKeranjang.value = items.reduce((total, item) => total + (item.jumlah || 1), 0)
  } catch {
    jumlahKeranjang.value = 0
  }
}

const addToKeranjang = async (produk) => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (produk.stok <= 0) {
    alert('Maaf, stok produk habis.')
    return
  }

  try {
    loadingCart.value = true
    await orderApi.addToKeranjang(produk.id, 1)
    jumlahKeranjang.value++
    alert('✅ Produk ditambahkan ke keranjang!')
  } catch (err) {
    const message = err.response?.data?.message || 'Gagal menambahkan ke keranjang'
    alert('❌ ' + message)
  } finally {
    loadingCart.value = false
  }
}

onMounted(async () => {
  await fetchKategori()
  await fetchProduk()
  await fetchKeranjang()
})
</script>

<style scoped>
.page-katalog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.hero-section {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 20px;
  background: linear-gradient(135deg, #e8f4fd, #d1ecf1);
  border-radius: 16px;
}
.hero-section h1 { font-size: 32px; color: #1B6CA8; margin-bottom: 8px; }
.hero-section p { color: #6c757d; font-size: 16px; }

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.filter-group { flex: 1; min-width: 150px; }

.search-input,
.filter-select {
  width: 100%;
  padding: 12px 16px;
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-img {
  background: linear-gradient(135deg, #e8f4fd, #d1ecf1);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.product-img img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.product-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.status-tersedia { background: #d4edda; color: #155724; }
.status-habis { background: #f8d7da; color: #721c24; }

.product-info { padding: 16px; }
.product-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-desc {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 12px;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-footer {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.price { font-size: 18px; font-weight: 700; color: #1B6CA8; }
.satuan { font-size: 13px; color: #6c757d; }
.stok { font-size: 12px; color: #6c757d; margin-left: auto; }

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
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}
.btn-primary { background: #1B6CA8; color: white; }
.btn-primary:hover:not(:disabled) {
  background: #154f7a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 108, 168, 0.3);
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-outline { background: transparent; color: #1B6CA8; border: 2px solid #1B6CA8; }
.btn-outline:hover { background: #1B6CA8; color: white; }
.w-full { width: 100%; }

.loading-state { text-align: center; padding: 60px 20px; color: #6c757d; }
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e8f4fd;
  border-top: 4px solid #1B6CA8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.empty-subtext { font-size: 14px; color: #6c757d; margin-bottom: 20px; }

@media (max-width: 768px) {
  .filter-bar { flex-direction: column; }
  .filter-group { min-width: 100%; }
  .product-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .hero-section h1 { font-size: 24px; }
  .product-img { height: 150px; }
}
@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .product-info { padding: 12px; }
  .product-info h3 { font-size: 14px; }
  .price { font-size: 15px; }
  .btn { font-size: 12px; padding: 8px 12px; }
}
</style>