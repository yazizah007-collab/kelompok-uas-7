<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h2>📊 Dashboard Admin</h2>
          <p class="text-gray-500 text-sm">Kelola seluruh data platform LautKu</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-gray-600 text-sm">
            👋 Selamat datang, <strong>{{ user.nama || user.name || 'Admin' }}</strong>
          </span>
          <div class="w-10 h-10 rounded-full bg-[#1B6CA8] text-white flex items-center justify-center font-bold">
            {{ userInitial }}
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            👥
          </div>
          <div>
            <p class="stat-label">Total Pengguna</p>
            <h3>{{ stats.users }}</h3>
            <span class="stat-change positive">+12%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            🐟
          </div>
          <div>
            <p class="stat-label">Total Produk</p>
            <h3>{{ stats.produk }}</h3>
            <span class="stat-change positive">+8%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-600">
            🛒
          </div>
          <div>
            <p class="stat-label">Total Order</p>
            <h3>{{ stats.orders }}</h3>
            <span class="stat-change positive">+5%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-orange-100 text-orange-600">
            📰
          </div>
          <div>
            <p class="stat-label">Total Artikel</p>
            <h3>{{ stats.artikel }}</h3>
            <span class="stat-change negative">-2%</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-section">
        <div class="recent-card">
          <h3 class="recent-title">📦 Order Terbaru</h3>
          <div v-if="loading" class="text-center py-8">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="recentOrders.length === 0" class="text-center py-8 text-gray-500">
            Belum ada order terbaru
          </div>
          <div v-else class="recent-list">
            <div v-for="order in recentOrders" :key="order.id" class="recent-item order-item">
              <div class="recent-item-left">
                <span class="order-icon">📦</span>
                <div>
                  <p class="order-name">{{ order.nama_produk || 'Produk' }}</p>
                  <span class="order-meta">
                    <span class="order-buyer">🧑 {{ order.pembeli_nama || 'Pembeli' }}</span>
                    <span class="order-date">{{ formatDate(order.createdAt || order.created_at) }}</span>
                  </span>
                  <span class="order-seller" v-if="order.nelayan_nama">
                    🎣 Dijual oleh {{ order.nelayan_nama }}
                  </span>
                </div>
              </div>
              <div class="recent-item-right">
                <span class="order-price">Rp {{ formatPrice(order.total_harga) }}</span>
                <span :class="['order-status', getStatusClass(order.status)]">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="recent-card">
          <h3 class="recent-title">👥 Pengguna Baru</h3>
          <div v-if="loading" class="text-center py-8">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="newUsers.length === 0" class="text-center py-8 text-gray-500">
            Belum ada pengguna baru
          </div>
          <div v-else class="recent-list">
            <div v-for="user in newUsers" :key="user.id" class="recent-item">
              <div class="recent-item-left">
                <div class="user-avatar-sm">
                  {{ (user.nama || user.name || 'U').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="order-name">{{ user.nama || user.name || 'User' }}</p>
                  <span class="order-date">{{ user.email || 'No email' }}</span>
                </div>
              </div>
              <div class="recent-item-right">
                <span :class="['user-role-badge', getRoleBadgeClass(user.role)]">
                  {{ user.role || 'User' }}
                </span>
              </div>
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
import { userApi, produkApi, orderApi, artikelApi } from '../../api'

// ========================================
// STATE
// ========================================
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const stats = ref({ users: 0, produk: 0, orders: 0, artikel: 0 })
const recentOrders = ref([])
const newUsers = ref([])
const loading = ref(true)

// ========================================
// COMPUTED
// ========================================
const userInitial = computed(() => {
  const name = user.value.nama || user.value.name || 'Admin'
  return name.charAt(0).toUpperCase()
})

// ========================================
// METHODS
// ========================================
const formatPrice = (price) => {
  return price ? new Intl.NumberFormat('id-ID').format(price) : '0'
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
  const statusMap = {
    'pending': 'status-pending',
    'dikonfirmasi': 'status-processing',
    'dikirim': 'status-shipped',
    'selesai': 'status-delivered',
    'dibatalkan': 'status-cancelled',
    // alias bahasa Inggris (jaga-jaga ada data lama)
    'processing': 'status-processing',
    'shipped': 'status-shipped',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  }
  return statusMap[status?.toLowerCase()] || 'status-pending'
}

const getStatusLabel = (status) => {
  const map = {
    'pending': '⏳ Pending',
    'dikonfirmasi': '✅ Dikonfirmasi',
    'dikirim': '🚚 Dikirim',
    'selesai': '🎉 Selesai',
    'dibatalkan': '❌ Dibatalkan',
    // alias bahasa Inggris
    'processing': '🔄 Diproses',
    'shipped': '🚚 Dikirim',
    'delivered': '✅ Selesai',
    'cancelled': '❌ Dibatalkan'
  }
  return map[status?.toLowerCase()] || status || 'Pending'
}

const getRoleBadgeClass = (role) => {
  const roleMap = {
    'admin': 'role-admin',
    'nelayan': 'role-nelayan',
    'pembeli': 'role-pembeli'
  }
  return roleMap[role?.toLowerCase()] || 'role-user'
}

// ========================================
// FETCH DATA
// ========================================
const fetchDashboardData = async () => {
  try {
    loading.value = true

    // Fetch semua data secara paralel menggunakan API yang benar
    const [usersRes, produkRes, ordersRes, artikelRes] = await Promise.all([
      userApi.getAll(),
      produkApi.getAll(),
      orderApi.getAll(),
      artikelApi.getAdminArticles()
    ])

    // Update stats
    const usersData = usersRes.data || []
    const produkData = produkRes.data || []
    const ordersData = ordersRes.data || []
    const artikelData = artikelRes.data || []

    stats.value = {
      users: usersData.length || 0,
      produk: produkData.length || 0,
      orders: ordersData.length || 0,
      artikel: artikelData.length || 0
    }

    // Update recent orders (ambil 5 terakhir).
    // Backend sudah mengembalikan order terurut terbaru & sudah dilengkapi
    // nama_produk, pembeli_nama, nelayan_nama, dan total_harga yang benar.
    const sortedOrders = [...ordersData].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at)
      const dateB = new Date(b.createdAt || b.created_at)
      return dateB - dateA
    })
    recentOrders.value = sortedOrders.slice(0, 5)

    // Update new users (ambil 5 terakhir)
    const sortedUsers = [...usersData].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.tanggal_daftar)
      const dateB = new Date(b.createdAt || b.tanggal_daftar)
      return dateB - dateA
    })
    newUsers.value = sortedUsers.slice(0, 5)

  } catch (err) {
    console.error('Error fetching dashboard data:', err)

    // Jika API error, tampilkan pesan error
    stats.value = {
      users: 0,
      produk: 0,
      orders: 0,
      artikel: 0
    }
    recentOrders.value = []
    newUsers.value = []
  } finally {
    loading.value = false
  }
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
  fetchDashboardData()
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
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e8f4fd;
}

.topbar h2 {
  color: #1B6CA8;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

/* ========================================
   STATS CARDS
   ======================================== */
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
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
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

.stat-change.negative {
  color: #e74c3c;
}

/* ========================================
   RECENT SECTION
   ======================================== */
.recent-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.recent-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.recent-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f8ff;
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

.order-item {
  align-items: flex-start;
}

.recent-item-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.recent-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.order-icon {
  font-size: 20px;
}

.order-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 2px 0;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.order-buyer {
  font-size: 12px;
  color: #1B6CA8;
  font-weight: 600;
}

.order-date {
  font-size: 12px;
  color: #6c757d;
}

.order-seller {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
}

.order-price {
  font-size: 14px;
  font-weight: 600;
  color: #1B6CA8;
}

/* ========================================
   ORDER STATUS BADGE
   ======================================== */
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

/* ========================================
   USER AVATAR & ROLE BADGE
   ======================================== */
.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1B6CA8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-admin {
  background: #cce5ff;
  color: #004085;
}

.role-nelayan {
  background: #d4edda;
  color: #155724;
}

.role-pembeli {
  background: #fff3cd;
  color: #856404;
}

.role-user {
  background: #e2e3e5;
  color: #383d41;
}

/* ========================================
   LOADING SPINNER
   ======================================== */
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e8f4fd;
  border-top: 3px solid #1B6CA8;
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
  .recent-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main {
    padding: 16px;
  }

  .topbar {
    flex-direction: column;
    gap: 12px;
  }

  .topbar h2 {
    font-size: 22px;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
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

  .recent-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .recent-item-right {
    width: 100%;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
