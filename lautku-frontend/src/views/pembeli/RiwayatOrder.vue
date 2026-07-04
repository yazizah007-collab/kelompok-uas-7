<template>
  <div class="page-riwayat">
    <!-- Header -->
    <div class="header-section">
      <h2>📦 Riwayat Pesanan</h2>
      <span class="order-count" v-if="orders.length > 0">{{ orders.length }} pesanan</span>
    </div>

    <!-- Filter Status -->
    <div class="filter-bar">
      <button
        v-for="status in statusFilters"
        :key="status.value"
        :class="['filter-btn', filterStatus === status.value ? 'active' : '']"
        @click="filterStatus = status.value"
      >
        {{ status.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat pesanan...</p>
    </div>

    <!-- Orders List -->
    <div v-else-if="filteredOrders.length > 0">
      <div class="order-card" v-for="o in filteredOrders" :key="o.id">
        <div class="order-header">
          <div>
            <span class="order-id">#{{ o.id?.toString().slice(0, 8) || 'ORDER' }}</span>
            <span class="order-date">{{ formatDate(o.created_at || o.createdAt) }}</span>
          </div>
          <span :class="['status-badge', getStatusClass(o.status)]">
            {{ getStatusLabel(o.status) }}
          </span>
        </div>

        <div class="order-body">
          <div class="order-address">
            <span class="address-icon">📍</span>
            <span>{{ o.alamat_pengiriman || 'Alamat tidak tersedia' }}</span>
          </div>
          <div class="order-note" v-if="o.catatan">
            <span class="note-icon">📝</span>
            <span>{{ o.catatan }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            Total: <strong>Rp {{ (o.total_harga || o.total || 0).toLocaleString('id-ID') }}</strong>
          </div>
          <div class="order-actions">
            <button
              v-if="isCancelable(o.status)"
              class="btn btn-danger btn-detail"
              :disabled="cancelingId === o.id"
              @click="cancelOrder(o)"
            >
              {{ cancelingId === o.id ? '⏳ Membatalkan...' : '✖ Batalkan Pesanan' }}
            </button>
            <button class="btn btn-outline btn-detail" @click="toggleDetail(o.id)">
              {{ selectedOrder === o.id ? 'Sembunyikan' : 'Lihat Detail' }}
            </button>
          </div>
        </div>

        <!-- Order Detail -->
        <div class="order-detail" v-if="selectedOrder === o.id && detailItems.length > 0">
          <h4>📋 Detail Pesanan</h4>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Penjual</th>
                  <th>Jumlah</th>
                  <th>Harga Satuan</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in detailItems" :key="d.id">
                  <td>{{ d.nama_produk || d.produk?.nama || 'Produk' }}</td>
                  <td>{{ d.nelayan_nama || '-' }}</td>
                  <td>{{ d.jumlah }}</td>
                  <td>Rp {{ (d.harga_satuan || d.harga || 0).toLocaleString('id-ID') }}</td>
                  <td>Rp {{ (d.subtotal || d.harga * d.jumlah || 0).toLocaleString('id-ID') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p class="empty-icon">📦</p>
      <p class="empty-text">Belum ada pesanan</p>
      <p class="empty-subtext">Yuk, mulai belanja hasil laut segar!</p>
      <router-link to="/katalog" class="btn btn-primary">🐟 Lihat Katalog</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { orderApi } from '../../api'

const orders = ref([])
const selectedOrder = ref(null)
const detailItems = ref([])
const loading = ref(true)
const filterStatus = ref('semua')
const cancelingId = ref(null)

// Status yang masih boleh dibatalkan pembeli, harus sama dengan
// CANCELABLE_STATUSES di backend (controllers/orderController.js)
const CANCELABLE_STATUSES = ['pending', 'dikonfirmasi']

const statusFilters = [
  { value: 'semua', label: '📋 Semua' },
  { value: 'pending', label: '⏳ Pending' },
  { value: 'dikonfirmasi', label: '✅ Dikonfirmasi' },
  { value: 'dikirim', label: '🚚 Dikirim' },
  { value: 'selesai', label: '🎉 Selesai' },
  { value: 'dibatalkan', label: '❌ Dibatalkan' }
]

const filteredOrders = computed(() => {
  if (filterStatus.value === 'semua') return orders.value
  return orders.value.filter(o => o.status === filterStatus.value)
})

const isCancelable = (status) => {
  return CANCELABLE_STATUSES.includes((status || '').toLowerCase())
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const map = {
    'pending': 'status-pending',
    'dikonfirmasi': 'status-confirmed',
    'dikirim': 'status-shipped',
    'selesai': 'status-delivered',
    'dibatalkan': 'status-cancelled'
  }
  return map[status?.toLowerCase()] || 'status-pending'
}

const getStatusLabel = (status) => {
  const map = {
    'pending': '⏳ Pending',
    'dikonfirmasi': '✅ Dikonfirmasi',
    'dikirim': '🚚 Dikirim',
    'selesai': '🎉 Selesai',
    'dibatalkan': '❌ Dibatalkan'
  }
  return map[status?.toLowerCase()] || status || 'Pending'
}

const fetchOrders = async () => {
  try {
    loading.value = true
    const res = await orderApi.getMyOrders()
    orders.value = res.data || []
  } catch (err) {
    console.error('Error fetching orders:', err)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const toggleDetail = async (id) => {
  if (selectedOrder.value === id) {
    selectedOrder.value = null
    detailItems.value = []
    return
  }
  try {
    const res = await orderApi.getById(id)
    const orderData = res.data || {}
    detailItems.value = orderData.details || orderData.items || []
    selectedOrder.value = id
  } catch (err) {
    alert('Gagal memuat detail pesanan')
  }
}

const cancelOrder = async (order) => {
  if (!confirm(`⚠️ Yakin ingin membatalkan pesanan #${order.id?.toString().slice(0, 8)}?`)) return

  try {
    cancelingId.value = order.id
    await orderApi.cancelOrder(order.id)
    order.status = 'dibatalkan'
  } catch (err) {
    console.error('Error canceling order:', err)
    const message = err.response?.data?.message || 'Gagal membatalkan pesanan. Silakan coba lagi.'
    alert(message)
  } finally {
    cancelingId.value = null
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.page-riwayat {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-section h2 { color: #1B6CA8; font-size: 28px; margin: 0; }
.order-count { background: #e8f4fd; color: #1B6CA8; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }

.filter-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-btn {
  padding: 8px 16px; border: 2px solid #e0e0e0; border-radius: 20px;
  background: white; font-size: 13px; font-weight: 500; color: #6c757d;
  cursor: pointer; transition: all 0.3s ease;
}
.filter-btn:hover { border-color: #1B6CA8; color: #1B6CA8; }
.filter-btn.active { background: #1B6CA8; border-color: #1B6CA8; color: white; }

.loading-state { text-align: center; padding: 60px 20px; color: #6c757d; }
.loading-spinner {
  width: 48px; height: 48px;
  border: 4px solid #e8f4fd; border-top: 4px solid #1B6CA8;
  border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.order-card {
  background: white; border-radius: 16px; padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.04);
  margin-bottom: 20px; transition: all 0.2s ease;
}
.order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10); }

.order-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f8ff;
}
.order-id { font-weight: 700; color: #1a1a2e; font-size: 15px; margin-right: 12px; }
.order-date { color: #6c757d; font-size: 13px; }

.status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-pending { background: #fff3cd; color: #856404; }
.status-confirmed { background: #cce5ff; color: #004085; }
.status-shipped { background: #d1ecf1; color: #0c5460; }
.status-delivered { background: #d4edda; color: #155724; }
.status-cancelled { background: #f8d7da; color: #721c24; }

.order-body { margin-bottom: 16px; font-size: 14px; color: #6c757d; }
.order-address, .order-note { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; }
.address-icon, .note-icon { font-size: 16px; flex-shrink: 0; }

.order-footer {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px; padding-top: 12px; border-top: 1px solid #f0f8ff;
}
.order-total { font-size: 16px; color: #1a1a2e; }
.order-total strong { color: #1B6CA8; font-size: 18px; }

.order-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.order-detail { margin-top: 16px; padding-top: 16px; border-top: 2px solid #f0f8ff; }
.order-detail h4 { font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 0 0 12px; }

.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table thead { background: #1B6CA8; color: white; }
.table th { padding: 10px 14px; text-align: left; font-size: 13px; font-weight: 600; }
.table td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
.table tbody tr:hover td { background: #f8f9fa; }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.empty-subtext { font-size: 14px; color: #6c757d; margin-bottom: 20px; }

.btn {
  padding: 10px 24px; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; text-decoration: none; transition: all 0.3s ease;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background: #1B6CA8; color: white; }
.btn-primary:hover { background: #154f7a; transform: translateY(-2px); }
.btn-outline { background: transparent; color: #1B6CA8; border: 2px solid #1B6CA8; }
.btn-outline:hover { background: #1B6CA8; color: white; }
.btn-danger { background: transparent; color: #dc3545; border: 2px solid #dc3545; }
.btn-danger:hover:not(:disabled) { background: #dc3545; color: white; }
.btn-detail { font-size: 13px; padding: 6px 16px; }

@media (max-width: 768px) {
  .header-section h2 { font-size: 22px; }
  .order-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .order-footer { flex-direction: column; align-items: stretch; gap: 8px; }
  .order-total { text-align: center; }
  .order-actions { flex-direction: column; }
  .btn-detail { width: 100%; justify-content: center; }
  .filter-bar { gap: 6px; }
  .filter-btn { font-size: 12px; padding: 6px 12px; }
}
@media (max-width: 480px) {
  .order-card { padding: 16px; }
  .order-id { font-size: 13px; }
  .order-date { font-size: 12px; }
  .table th, .table td { padding: 6px 10px; font-size: 12px; }
}
</style>