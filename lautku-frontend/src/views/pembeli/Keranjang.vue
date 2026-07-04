<template>
  <div class="page-keranjang">
    <!-- Header -->
    <div class="header-section">
      <h2>🛒 Keranjang Belanja</h2>
      <span class="item-count" v-if="items.length > 0">{{ items.length }} item</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat keranjang...</p>
    </div>

    <!-- Keranjang Items -->
    <div v-else-if="items.length > 0">
      <div class="keranjang-item" v-for="item in items" :key="item.id">
        <div class="item-icon">
          <img
            :src="item.gambar || '/product-placeholder.png'"
            :alt="item.nama_produk"
            @error="handleImageError"
          />
        </div>
        <div class="item-info">
          <h3>{{ item.nama_produk }}</h3>
          <p class="item-price">Rp {{ item.harga.toLocaleString('id-ID') }} / {{ item.satuan || 'kg' }}</p>
          <p class="item-supplier" v-if="item.nelayan">👨‍🌾 {{ item.nelayan.nama || item.nelayan.name }}</p>
        </div>
        <div class="item-qty">
          <button @click="updateJumlah(item, item.jumlah - 1)" :disabled="item.jumlah <= 1">−</button>
          <span>{{ item.jumlah }}</span>
          <button @click="updateJumlah(item, item.jumlah + 1)" :disabled="item.jumlah >= (item.stok || 999)">+</button>
        </div>
        <div class="item-subtotal">
          Rp {{ (item.harga * item.jumlah).toLocaleString('id-ID') }}
        </div>
        <button class="btn btn-danger btn-delete" @click="deleteItem(item.id)">🗑️</button>
      </div>

      <!-- Ringkasan -->
      <div class="summary-section">
        <div class="summary-card">
          <h3>📋 Ringkasan Belanja</h3>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>Rp {{ total.toLocaleString('id-ID') }}</span>
          </div>
          <div class="summary-row">
            <span>Jumlah Item</span>
            <span>{{ totalItems }} item</span>
          </div>
          <div class="summary-row total-row">
            <span>Total</span>
            <span>Rp {{ total.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="checkout-box">
          <h3>📍 Informasi Pengiriman</h3>
          <div class="form-group">
            <label>📍 Alamat Pengiriman <span class="required">*</span></label>
            <textarea
              v-model="alamat"
              placeholder="Masukkan alamat pengiriman lengkap..."
              :class="{ 'input-error': errors.alamat }"
            ></textarea>
            <span v-if="errors.alamat" class="error-text">{{ errors.alamat }}</span>
          </div>
          <div class="form-group">
            <label>📝 Catatan</label>
            <input
              v-model="catatan"
              placeholder="Catatan untuk penjual (opsional)"
            />
          </div>
          <button
            class="btn btn-primary checkout-btn"
            @click="checkout"
            :disabled="loadingCheckout"
          >
            {{ loadingCheckout ? '⏳ Memproses...' : '🚀 Checkout Sekarang' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p class="empty-icon">🛒</p>
      <p class="empty-text">Keranjang kamu kosong</p>
      <p class="empty-subtext">Yuk, mulai belanja hasil laut segar!</p>
      <router-link to="/katalog" class="btn btn-primary">🐟 Lihat Katalog</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '../../api'

const router = useRouter()
const items = ref([])
const alamat = ref('')
const catatan = ref('')
const loading = ref(true)
const loadingCheckout = ref(false)
const errors = ref({ alamat: '' })

const total = computed(() => items.value.reduce((sum, i) => sum + (i.harga * i.jumlah), 0))
const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.jumlah, 0))

const handleImageError = (e) => {
  e.target.src = '/product-placeholder.png'
}

const fetchKeranjang = async () => {
  try {
    loading.value = true
    const res = await orderApi.getKeranjang()
    items.value = res.data || []
  } catch (err) {
    console.error('Error fetching cart:', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

const updateJumlah = async (item, jumlah) => {
  if (jumlah < 1) return
  if (item.stok && jumlah > item.stok) {
    alert(`Stok tersedia hanya ${item.stok} ${item.satuan || 'kg'}`)
    return
  }
  try {
    await orderApi.updateKeranjang(item.id, jumlah)
    await fetchKeranjang()
  } catch (err) {
    alert('Gagal mengupdate jumlah. Silakan coba lagi.')
  }
}

const deleteItem = async (id) => {
  if (!confirm('⚠️ Hapus item ini dari keranjang?')) return
  try {
    await orderApi.deleteKeranjang(id)
    await fetchKeranjang()
  } catch (err) {
    alert('Gagal menghapus item. Silakan coba lagi.')
  }
}

const checkout = async () => {
  if (!alamat.value.trim()) {
    errors.value.alamat = 'Alamat pengiriman wajib diisi'
    return
  } else {
    errors.value.alamat = ''
  }

  if (items.value.length === 0) {
    alert('Keranjang kosong!')
    return
  }

  try {
    loadingCheckout.value = true
    await orderApi.checkout({
      alamat_pengiriman: alamat.value,
      catatan: catatan.value || ''
    })
    alert('✅ Checkout berhasil! Pesanan sedang diproses.')
    router.push('/orders')
  } catch (err) {
    const message = err.response?.data?.message || 'Checkout gagal. Silakan coba lagi.'
    alert('❌ ' + message)
  } finally {
    loadingCheckout.value = false
  }
}

onMounted(() => {
  fetchKeranjang()
})
</script>

<style scoped>
.page-keranjang {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-section h2 { color: #1B6CA8; font-size: 28px; margin: 0; }
.item-count {
  background: #e8f4fd;
  color: #1B6CA8;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.loading-state { text-align: center; padding: 60px 20px; color: #6c757d; }
.loading-spinner {
  width: 48px; height: 48px;
  border: 4px solid #e8f4fd;
  border-top: 4px solid #1B6CA8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.keranjang-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 16px;
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}
.keranjang-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10); }

.item-icon {
  width: 64px; height: 64px; flex-shrink: 0;
  background: linear-gradient(135deg, #e8f4fd, #d1ecf1);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.item-icon img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }

.item-info { flex: 1; min-width: 0; }
.item-info h3 { font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0 0 4px; }
.item-price { font-size: 14px; color: #6c757d; margin: 0; }
.item-supplier { font-size: 12px; color: #6c757d; margin: 4px 0 0; }

.item-qty { display: flex; align-items: center; gap: 12px; }
.item-qty button {
  width: 32px; height: 32px;
  border: 2px solid #1B6CA8;
  border-radius: 50%;
  background: white;
  color: #1B6CA8;
  font-size: 18px; font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.item-qty button:hover:not(:disabled) { background: #1B6CA8; color: white; }
.item-qty button:disabled { opacity: 0.4; cursor: not-allowed; }
.item-qty span { font-size: 16px; font-weight: 600; min-width: 24px; text-align: center; }

.item-subtotal { font-size: 16px; font-weight: 700; color: #1B6CA8; min-width: 140px; text-align: right; }

.summary-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}
.summary-card, .checkout-box {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.04);
}
.summary-card h3, .checkout-box h3 {
  font-size: 18px; font-weight: 600; color: #1a1a2e;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f8ff;
}
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #6c757d; }
.summary-row.total-row {
  padding-top: 12px; margin-top: 8px;
  border-top: 2px solid #f0f8ff;
  font-size: 18px; font-weight: 700; color: #1a1a2e;
}
.summary-row.total-row span:last-child { color: #1B6CA8; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #1a1a2e; }
.required { color: #e74c3c; }
.form-group input,
.form-group textarea {
  width: 100%; padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px; font-family: inherit;
  transition: all 0.3s ease;
}
.form-group input:focus, .form-group textarea:focus {
  border-color: #1B6CA8; outline: none;
  box-shadow: 0 0 0 3px rgba(27,108,168,0.1);
}
.form-group textarea { resize: vertical; min-height: 60px; }
.input-error { border-color: #e74c3c !important; }
.error-text { color: #e74c3c; font-size: 12px; display: block; margin-top: 4px; }

.checkout-btn { width: 100%; padding: 14px; font-size: 16px; margin-top: 4px; }

.btn {
  padding: 10px 24px; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; text-decoration: none; transition: all 0.3s ease;
}
.btn-primary { background: #1B6CA8; color: white; }
.btn-primary:hover:not(:disabled) { background: #154f7a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(27,108,168,0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-danger { background: #e74c3c; color: white; }
.btn-danger:hover { background: #c0392b; }
.btn-delete { padding: 8px 12px; font-size: 16px; border-radius: 8px; }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.empty-subtext { font-size: 14px; color: #6c757d; margin-bottom: 20px; }

@media (max-width: 768px) {
  .keranjang-item { flex-wrap: wrap; gap: 12px; }
  .item-icon { width: 48px; height: 48px; }
  .item-info { flex: 1 1 100%; }
  .item-qty { order: 3; }
  .item-subtotal { order: 4; text-align: left; min-width: auto; }
  .btn-delete { order: 5; margin-left: auto; }
  .summary-section { grid-template-columns: 1fr; }
  .header-section h2 { font-size: 22px; }
}
@media (max-width: 480px) {
  .keranjang-item { padding: 16px; }
  .item-info h3 { font-size: 14px; }
  .item-qty button { width: 28px; height: 28px; font-size: 14px; }
  .checkout-btn { font-size: 14px; padding: 12px; }
}
</style>