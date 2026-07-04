<template>
  <div class="page-detail-produk">
    <!-- Back Button -->
    <router-link to="/katalog" class="back-link">← Kembali ke Katalog</router-link>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat produk...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-icon">😞</p>
      <p class="error-text">{{ error }}</p>
      <button class="btn btn-primary" @click="fetchProduk">Coba Lagi</button>
    </div>

    <!-- Product Detail -->
    <div class="detail-wrapper" v-else-if="produk">
      <!-- Product Image -->
      <div class="detail-img">
        <img
          v-if="produk.gambar"
          :src="produk.gambar"
          :alt="produk.nama_produk"
          @error="handleImageError"
          referrerpolicy="no-referrer"
        />
        <div v-else class="img-placeholder">
          <span>🐟</span>
          <p>Tidak ada gambar</p>
        </div>
      </div>

      <!-- Product Info -->
      <div class="detail-info">
        <span class="kategori-badge">{{ getKategoriNama(produk.kategori_id) }}</span>
        <h1>{{ produk.nama_produk }}</h1>

        <div class="price-section">
          <p class="harga">Rp {{ produk.harga.toLocaleString('id-ID') }}</p>
          <span class="satuan">/ {{ produk.satuan || 'kg' }}</span>
        </div>

        <div class="stock-section">
          <span :class="['stock-badge', produk.stok > 0 ? 'stock-available' : 'stock-empty']">
            {{ produk.stok > 0 ? '✅ Tersedia' : '❌ Habis' }}
          </span>
          <span class="stock-text">Stok: <strong>{{ produk.stok || 0 }} {{ produk.satuan || 'kg' }}</strong></span>
        </div>

        <div class="deskripsi" v-if="produk.deskripsi">
          <h3>📝 Deskripsi</h3>
          <p>{{ produk.deskripsi }}</p>
        </div>

        <!-- Supplier Info -->
        <div class="supplier-info" v-if="produk.nelayan">
          <h3>👨‍🌾 Dijual oleh</h3>
          <div class="supplier-detail">
            <span class="supplier-name">{{ produk.nelayan.nama || produk.nelayan.name }}</span>
            <span class="supplier-location" v-if="produk.nelayan.lokasi">📍 {{ produk.nelayan.lokasi }}</span>
          </div>
        </div>

        <!-- Quantity & Keranjang: hanya untuk pembeli atau belum login -->
        <template v-if="isPembeli">
          <div class="qty-wrapper">
            <label>Jumlah:</label>
            <div class="qty-control">
              <button @click="decreaseQty" :disabled="jumlah <= 1">−</button>
              <span>{{ jumlah }}</span>
              <button @click="increaseQty" :disabled="jumlah >= (produk.stok || 0)">+</button>
            </div>
            <span class="qty-hint" v-if="produk.stok > 0">
              Maksimal {{ produk.stok }} {{ produk.satuan || 'kg' }}
            </span>
          </div>
          <button
            class="btn btn-primary add-btn"
            @click="addToKeranjang"
            :disabled="loadingCart || produk.stok <= 0"
          >
            {{ loadingCart ? '⏳ Memproses...' : produk.stok > 0 ? '+ Tambah ke Keranjang' : '❌ Stok Habis' }}
          </button>
        </template>

        <!-- Info saja untuk admin & nelayan -->
        <div v-else class="info-only-box">
          <p>👁️ Anda melihat produk ini sebagai <strong>{{ authStore.role }}</strong></p>
          <p>Stok tersedia: <strong>{{ produk.stok || 0 }} {{ produk.satuan || 'kg' }}</strong></p>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="empty-state">
      <p class="empty-icon">🐟</p>
      <p class="empty-text">Produk tidak ditemukan</p>
      <router-link to="/katalog" class="btn btn-primary">Lihat Katalog</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { produkApi, orderApi } from '../../api'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const produk = ref(null)
const jumlah = ref(1)
const loading = ref(true)
const loadingCart = ref(false)
const error = ref('')
const kategoriMap = ref({})

const isPembeli = computed(() => {
  return authStore.role === 'pembeli' || !authStore.isLoggedIn
})

const getKategoriNama = (id) => {
  if (!id) return 'Umum'
  const kategori = kategoriMap.value[id]
  return kategori?.nama_kategori || kategori?.nama || 'Umum'
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const decreaseQty = () => {
  if (jumlah.value > 1) jumlah.value--
}

const increaseQty = () => {
  if (produk.value && jumlah.value < produk.value.stok) {
    jumlah.value++
  }
}

const fetchKategori = async () => {
  try {
    const res = await produkApi.getKategoris()
    const kategoris = res.data || []
    kategoriMap.value = kategoris.reduce((acc, k) => {
      acc[k.id] = k
      return acc
    }, {})
  } catch (err) {
    console.error('Error fetching kategori:', err)
  }
}

const fetchProduk = async () => {
  try {
    loading.value = true
    error.value = ''
    const id = route.params.id
    const res = await produkApi.getById(id)
    produk.value = res.data || null
    jumlah.value = 1
    if (produk.value) {
      await fetchKategori()
    }
  } catch (err) {
    console.error('Error fetching product:', err)
    if (err.response?.status === 404) {
      error.value = 'Produk tidak ditemukan'
    } else {
      error.value = err.response?.data?.message || 'Gagal memuat produk. Silakan coba lagi.'
    }
    produk.value = null
  } finally {
    loading.value = false
  }
}

const addToKeranjang = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  if (!produk.value || produk.value.stok <= 0) {
    alert('Maaf, stok produk habis.')
    return
  }

  try {
    loadingCart.value = true
    await orderApi.addToKeranjang(produk.value.id, jumlah.value)
    alert('✅ Produk berhasil ditambahkan ke keranjang!')
    router.push('/keranjang')
  } catch (err) {
    console.error('Error adding to cart:', err)
    const message = err.response?.data?.message || 'Gagal menambahkan ke keranjang.'
    alert('❌ ' + message)
  } finally {
    loadingCart.value = false
  }
}

onMounted(() => {
  fetchProduk()
})
</script>

<style scoped>
.page-detail-produk {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.back-link {
  color: #1B6CA8;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 24px;
  transition: color 0.2s;
}
.back-link:hover { color: #154f7a; text-decoration: underline; }

.loading-state { text-align: center; padding: 80px 20px; color: #6c757d; }
.loading-spinner {
  width: 48px; height: 48px;
  border: 4px solid #e8f4fd;
  border-top: 4px solid #1B6CA8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.error-state { text-align: center; padding: 80px 20px; }
.error-icon { font-size: 48px; margin-bottom: 16px; }
.error-text { font-size: 16px; color: #6c757d; margin-bottom: 20px; }

.detail-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-top: 16px;
}

.detail-img {
  background: linear-gradient(135deg, #e8f4fd, #d1ecf1);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  overflow: hidden;
}
.detail-img img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}
.img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6c757d;
}
.img-placeholder span { font-size: 64px; }
.img-placeholder p { font-size: 14px; }

.detail-info { padding: 16px 0; }

.kategori-badge {
  background: #e8f4fd;
  color: #1B6CA8;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.detail-info h1 { font-size: 28px; color: #1a1a2e; margin: 16px 0 8px; }

.price-section { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.harga { font-size: 28px; font-weight: 700; color: #1B6CA8; margin: 0; }
.satuan { font-size: 16px; color: #6c757d; }

.stock-section { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.stock-badge { padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.stock-available { background: #d4edda; color: #155724; }
.stock-empty { background: #f8d7da; color: #721c24; }
.stock-text { font-size: 14px; color: #6c757d; }

.deskripsi { margin: 20px 0; }
.deskripsi h3 { font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.deskripsi p { font-size: 15px; color: #333; line-height: 1.7; }

.supplier-info {
  margin: 20px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}
.supplier-info h3 { font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.supplier-detail { display: flex; flex-direction: column; gap: 4px; }
.supplier-name { font-weight: 500; color: #1a1a2e; }
.supplier-location { font-size: 13px; color: #6c757d; }

.qty-wrapper { display: flex; align-items: center; gap: 16px; margin: 24px 0; flex-wrap: wrap; }
.qty-wrapper label { font-weight: 600; font-size: 14px; }
.qty-control { display: flex; align-items: center; gap: 12px; }
.qty-control button {
  width: 36px; height: 36px;
  border: 2px solid #1B6CA8;
  border-radius: 50%;
  background: white;
  color: #1B6CA8;
  font-size: 20px; font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.qty-control button:hover:not(:disabled) { background: #1B6CA8; color: white; }
.qty-control button:disabled { opacity: 0.4; cursor: not-allowed; }
.qty-control span { font-size: 18px; font-weight: 600; min-width: 32px; text-align: center; }
.qty-hint { font-size: 12px; color: #6c757d; }

.add-btn { padding: 14px 32px; font-size: 16px; width: 100%; justify-content: center; }

.info-only-box {
  margin-top: 24px;
  padding: 16px 20px;
  background: #f0f8ff;
  border: 1.5px solid #bee3f8;
  border-radius: 12px;
  font-size: 14px;
  color: #2c5282;
  line-height: 1.8;
}
.info-only-box strong { color: #1B6CA8; }

.btn {
  padding: 10px 24px; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; text-decoration: none; transition: all 0.3s ease;
}
.btn-primary { background: #1B6CA8; color: white; }
.btn-primary:hover:not(:disabled) { background: #154f7a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(27,108,168,0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 18px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; }

@media (max-width: 768px) {
  .detail-wrapper { grid-template-columns: 1fr; gap: 24px; }
  .detail-img { min-height: 250px; padding: 20px; }
  .detail-img img { max-height: 250px; }
  .detail-info h1 { font-size: 22px; }
  .harga { font-size: 22px; }
}
@media (max-width: 480px) {
  .detail-img { min-height: 200px; padding: 16px; }
  .detail-img img { max-height: 200px; }
  .detail-info h1 { font-size: 20px; }
  .harga { font-size: 20px; }
  .add-btn { font-size: 14px; padding: 12px 24px; }
}
</style>