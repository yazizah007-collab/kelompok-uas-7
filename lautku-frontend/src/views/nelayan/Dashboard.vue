<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <div class="topbar">
        <div>
          <h2>📊 Dashboard Nelayan</h2>
          <p class="text-gray-500 text-sm">Kelola tambak, produk, dan panen Anda</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-gray-600 text-sm">
            👋 Selamat datang, <strong>{{ user.nama || user.name || 'Nelayan' }}</strong>
          </span>
          <div class="user-avatar">
            {{ userInitial }}
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            🌾
          </div>
          <div>
            <p class="stat-label">Total Tambak</p>
            <h3>{{ stats.tambak }}</h3>
            <span class="stat-change positive">+2 bulan ini</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            🐟
          </div>
          <div>
            <p class="stat-label">Total Produk</p>
            <h3>{{ stats.produk }}</h3>
            <span class="stat-change positive">+5 terjual</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-600">
            🌿
          </div>
          <div>
            <p class="stat-label">Panen Berlangsung</p>
            <h3>{{ stats.panenAktif }}</h3>
            <span class="stat-change" :class="stats.panenAktif > 0 ? 'positive' : 'neutral'">
              {{ stats.panenAktif > 0 ? '● Aktif' : '● Tidak aktif' }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-orange-100 text-orange-600">
            📦
          </div>
          <div>
            <p class="stat-label">Total Order Masuk</p>
            <h3>{{ stats.orders }}</h3>
            <span class="stat-change positive">+3 minggu ini</span>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <router-link to="/nelayan/tambak" class="quick-action-btn">
          <span>🌾</span>
          <span>Kelola Tambak</span>
        </router-link>
        <router-link to="/nelayan/produk" class="quick-action-btn">
          <span>🐟</span>
          <span>Kelola Produk</span>
        </router-link>
        <router-link to="/nelayan/panen" class="quick-action-btn">
          <span>🌿</span>
          <span>Siklus Panen</span>
        </router-link>
        <router-link to="/nelayan/monitoring" class="quick-action-btn">
          <span>💧</span>
          <span>Monitoring Air</span>
        </router-link>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>🌾 Tambak Aktif</h3>
          <router-link to="/nelayan/tambak" class="view-all">
            Lihat Semua →
          </router-link>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat data tambak...</p>
        </div>

        <div v-else-if="tambaks.length === 0" class="empty-state">
          <p class="empty-icon">🌾</p>
          <p class="empty-text">Belum ada tambak</p>
          <p class="empty-subtext">Mulai kelola tambak Anda sekarang</p>
          <router-link to="/nelayan/tambak" class="btn btn-primary">
            + Tambah Tambak
          </router-link>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nama Tambak</th>
                <th>📍 Lokasi</th>
                <th>🐟 Jenis Budidaya</th>
                <th>📏 Luas (Ha)</th>
                <th>📊 Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tambaks.slice(0, 5)" :key="t.id">
                <td>
                  <span class="font-medium">{{ t.nama_tambak || t.nama }}</span>
                </td>
                <td>{{ t.lokasi }}</td>
                <td>
                  <span class="category-badge">{{ t.jenis_budidaya || t.jenis }}</span>
                </td>
                <td>{{ t.luas || t.luas_ha || 0 }} Ha</td>
                <td>
                  <span :class="['status-badge', getStatusClass(t.status)]">
                    {{ getStatusLabel(t.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" v-if="recentOrders.length > 0">
        <div class="card-header">
          <h3>📦 Order Terbaru</h3>
          <router-link to="/nelayan/orders" class="view-all">
            Lihat Semua →
          </router-link>
        </div>

        <div class="recent-list">
          <div v-for="order in recentOrders.slice(0, 3)" :key="order.id" class="recent-item">
            <div class="recent-item-left">
              <span class="order-icon">📦</span>
              <div>
                <p class="order-name">#{{ order.id?.toString().slice(0, 8) || 'Order' }}</p>
                <span class="order-date">{{ formatDate(order.created_at || order.createdAt) }}</span>
              </div>
            </div>
            <div class="recent-item-right">
              <span class="order-price">Rp {{ formatPrice(order.total_harga) }}</span>
              <span :class="['order-status', getOrderStatusClass(order.status)]">
                {{ getOrderStatusLabel(order.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { tambakApi, produkApi, orderApi, panenApi } from '../../api'

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const stats = ref({ tambak: 0, produk: 0, panenAktif: 0, orders: 0 })
const tambaks = ref([])
const recentOrders = ref([])
const loading = ref(true)

const userInitial = computed(() => {
  const name = user.value.nama || user.value.name || 'Nelayan'
  return name.charAt(0).toUpperCase()
})

const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('id-ID').format(price)
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
    'aktif': 'status-aktif',
    'inactive': 'status-inactive',
    'panen': 'status-panen',
    'kosong': 'status-kosong'
  }
  return map[status?.toLowerCase()] || 'status-aktif'
}

const getStatusLabel = (status) => {
  const map = {
    'aktif': '✅ Aktif',
    'inactive': '⭕ Tidak Aktif',
    'panen': '🌿 Panen',
    'kosong': '🔄 Kosong'
  }
  return map[status?.toLowerCase()] || status || 'Aktif'
}

const getOrderStatusClass = (status) => {
  const map = {
    'pending': 'status-pending',
    'dikonfirmasi': 'status-processing',
    'dikirim': 'status-shipped',
    'selesai': 'status-delivered',
    'dibatalkan': 'status-cancelled'
  }
  return map[status?.toLowerCase()] || 'status-pending'
}

const getOrderStatusLabel = (status) => {
  const map = {
    'pending': '⏳ Pending',
    'dikonfirmasi': '✅ Dikonfirmasi',
    'dikirim': '🚚 Dikirim',
    'selesai': '✅ Selesai',
    'dibatalkan': '❌ Dibatalkan'
  }
  return map[status?.toLowerCase()] || status || 'Pending'
}

const fetchDashboardData = async () => {
  try {
    loading.value = true

    const [tambakRes, produkRes, orderRes, panenRes] = await Promise.all([
      tambakApi.getAll(),
      produkApi.getAll(),
      orderApi.getAll(),
      panenApi.getAll()
    ])

    const userId = user.value.id
    const tambakData = tambakRes.data || []
    const produkData = produkRes.data || []
    const orderData = orderRes.data || []
    const panenData = panenRes.data || []

    tambaks.value = tambakData

    stats.value = {
      tambak: tambakData.length || 0,
      produk: produkData.filter(p => p.nelayan_id === userId).length || 0,
      panenAktif: panenData.filter(p => p.status === 'berlangsung' || p.status === 'aktif').length || 0,
      orders: orderData.length || 0
    }

    const sortedOrders = [...orderData].sort((a, b) => {
      const dateA = new Date(a.created_at || a.tanggal)
      const dateB = new Date(b.created_at || b.tanggal)
      return dateB - dateA
    })
    recentOrders.value = sortedOrders.slice(0, 5)

  } catch (err) {
    console.error('Error fetching dashboard data:', err)

    stats.value = {
      tambak: 0,
      produk: 0,
      panenAktif: 0,
      orders: 0
    }
    tambaks.value = []
    recentOrders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
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

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1B6CA8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-label {
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.stat-card h3 {
  font-size: 30px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-top: 4px;
}

.stat-change.positive {
  color: #2ecc71;
}

.stat-change.neutral {
  color: #f39c12;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: #1a1a2e;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.quick-action-btn span:first-child {
  font-size: 28px;
}

.quick-action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(27, 108, 168, 0.15);
  border-color: #1B6CA8;
  color: #1B6CA8;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f8ff;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.view-all {
  color: #1B6CA8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all:hover {
  color: #154f7a;
  text-decoration: underline;
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

.font-medium {
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-aktif {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #e2e3e5;
  color: #383d41;
}

.status-panen {
  background: #cce5ff;
  color: #004085;
}

.status-kosong {
  background: #fff3cd;
  color: #856404;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #e8f4fd;
  color: #1B6CA8;
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background: #cce5ff;
  color: #004085;
}

.status-delivered {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

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
  text-decoration: none;
}

.btn-primary {
  background: #1B6CA8;
  color: white;
}

.btn-primary:hover {
  background: #154f7a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 108, 168, 0.3);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.recent-item:hover {
  background: #e8f4fd;
  transform: translateX(4px);
}

.recent-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-item-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-icon {
  font-size: 20px;
}

.order-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  margin: 0;
}

.order-date {
  font-size: 12px;
  color: #6c757d;
}

.order-price {
  font-size: 14px;
  font-weight: 600;
  color: #1B6CA8;
}

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

@media (max-width: 1024px) {
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
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .stat-card h3 {
    font-size: 22px;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .recent-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .recent-item-right {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .table th,
  .table td {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>