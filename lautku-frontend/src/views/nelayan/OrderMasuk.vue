<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <div class="topbar">
        <div>
          <h2>📦 Order Masuk</h2>
          <p class="text-gray-500 text-sm">Kelola pesanan yang masuk untuk produkmu</p>
        </div>
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
      <div v-if="loading" class="text-center py-8">
        <div class="loading-spinner"></div>
        <p class="text-gray-500 mt-2">Memuat pesanan...</p>
      </div>

      <!-- Orders List -->
      <div v-else-if="filteredOrders.length > 0" class="order-list">
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
              <span>📍</span>
              <span>{{ o.alamat_pengiriman || 'Alamat tidak tersedia' }}</span>
            </div>
            <div class="order-note" v-if="o.catatan">
              <span>📝</span>
              <span>{{ o.catatan }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              Total: <strong>Rp {{ (o.total_harga || 0).toLocaleString('id-ID') }}</strong>
            </div>
            <div class="order-actions">
              <button
                v-if="o.status === 'pending'"
                class="btn btn-primary"
                :disabled="updatingId === o.id"
                @click="ubahStatus(o, 'dikonfirmasi')"
              >
                ✅ Konfirmasi
              </button>
              <button
                v-if="o.status === 'dikonfirmasi'"
                class="btn btn-primary"
                :disabled="updatingId === o.id"
                @click="ubahStatus(o, 'dikirim')"
              >
                🚚 Kirim
              </button>
              <button
                v-if="o.status === 'dikirim'"
                class="btn btn-primary"
                :disabled="updatingId === o.id"
                @click="ubahStatus(o, 'selesai')"
              >
                🎉 Selesaikan
              </button>
              <button
                v-if="o.status === 'pending' || o.status === 'dikonfirmasi'"
                class="btn btn-outline-danger"
                :disabled="updatingId === o.id"
                @click="ubahStatus(o, 'dibatalkan')"
              >
                ❌ Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p class="empty-icon">📦</p>
        <p class="empty-text">Belum ada pesanan masuk</p>
        <p class="empty-subtext">Pesanan dari pembeli untuk produkmu akan muncul di sini</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { orderApi } from '../../api'

const orders = ref([])
const loading = ref(true)
const filterStatus = ref('semua')
const updatingId = ref(null)

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
    const res = await orderApi.getAll()
    orders.value = (res.data || []).sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt)
      const dateB = new Date(b.created_at || b.createdAt)
      return dateB - dateA
    })
  } catch (err) {
    console.error('Error fetching orders:', err)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const ubahStatus = async (order, statusBaru) => {
  try {
    updatingId.value = order.id
    await orderApi.updateStatus(order.id, statusBaru)
    order.status = statusBaru
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengubah status pesanan')
  } finally {
    updatingId.value = null
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; background: #f0f8ff; }
.main { flex: 1; padding: 24px 32px; overflow-y: auto; }

.topbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e8f4fd;
}
.topbar h2 { color: #1B6CA8; font-size: 24px; font-weight: 700; margin: 0; }
.order-count { background: #e8f4fd; color: #1B6CA8; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }

.filter-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-btn {
  padding: 8px 16px; border: 2px solid #e0e0e0; border-radius: 20px;
  background: white; font-size: 13px; font-weight: 500; color: #6c757d;
  cursor: pointer; transition: all 0.3s ease;
}
.filter-btn:hover { border-color: #1B6CA8; color: #1B6CA8; }
.filter-btn.active { background: #1B6CA8; border-color: #1B6CA8; color: white; }

.loading-spinner {
  width: 40px; height: 40px; border: 4px solid #e8f4fd; border-top: 4px solid #1B6CA8;
  border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.order-list { display: flex; flex-direction: column; gap: 20px; }
.order-card {
  background: white; border-radius: 16px; padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
}

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

.order-footer {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px; padding-top: 12px; border-top: 1px solid #f0f8ff;
}
.order-total { font-size: 16px; color: #1a1a2e; }
.order-total strong { color: #1B6CA8; font-size: 18px; }
.order-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.btn {
  padding: 8px 18px; border: none; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.3s ease;
}
.btn-primary { background: #1B6CA8; color: white; }
.btn-primary:hover:not(:disabled) { background: #154f7a; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline-danger { background: transparent; color: #e74c3c; border: 2px solid #e74c3c; }
.btn-outline-danger:hover:not(:disabled) { background: #e74c3c; color: white; }
.btn-outline-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 16px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.empty-subtext { font-size: 14px; color: #6c757d; }

@media (max-width: 768px) {
  .main { padding: 16px; }
  .order-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .order-footer { flex-direction: column; align-items: stretch; gap: 12px; }
  .order-actions { justify-content: stretch; }
  .order-actions .btn { flex: 1; }
}
</style>