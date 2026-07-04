<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main">
      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h2>👥 Manajemen Pengguna</h2>
          <p class="text-gray-500 text-sm">Kelola semua pengguna di platform LautKu</p>
        </div>
        <div class="topbar-actions">
          <span class="user-count">Total: {{ users.length }} pengguna</span>
        </div>
      </div>

      <!-- Filter & Search -->
      <div class="card filter-card">
        <div class="filter-grid">
          <div class="filter-group">
            <label>🔍 Cari Pengguna</label>
            <input 
              v-model="searchQuery" 
              placeholder="Cari nama atau email..."
              class="search-input"
            />
          </div>
          <div class="filter-group">
            <label>📊 Filter Role</label>
            <select v-model="filterRole" class="filter-select">
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="nelayan">Nelayan</option>
              <option value="pembeli">Pembeli</option>
            </select>
          </div>
          <div class="filter-group">
            <label>📊 Filter Status</label>
            <select v-model="filterStatus" class="filter-select">
              <option value="">Semua Status</option>
              <option value="aktif">✅ Aktif</option>
              <option value="suspend">⛔ Suspend</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabel Pengguna -->
      <div class="card table-card">
        <div v-if="loading" class="text-center py-8">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-2">Memuat data pengguna...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-8">
          <p class="text-gray-500 text-lg">📭 Tidak ada pengguna ditemukan</p>
          <p class="text-gray-400 text-sm">Ubah filter pencarian untuk melihat lebih banyak hasil</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>👤 Nama</th>
                <th>📧 Email</th>
                <th>🎯 Role</th>
                <th>📊 Status</th>
                <th>📅 Bergabung</th>
                <th>⚡ Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in filteredUsers" :key="user.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ getUserInitial(user.nama || user.name) }}
                    </div>
                    <span class="user-name">{{ user.nama || user.name || 'User' }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', getRoleClass(user.role)]">
                    {{ getRoleIcon(user.role) }} {{ user.role }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', user.status === 'aktif' ? 'status-aktif' : 'status-suspend']">
                    {{ user.status === 'aktif' ? '✅ Aktif' : '⛔ Suspend' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt || user.created_at) }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="toggleSuspend(user)"
                      :class="user.status === 'aktif' ? 'btn-action btn-suspend' : 'btn-action btn-activate'"
                      :title="user.status === 'aktif' ? 'Suspend Pengguna' : 'Aktifkan Pengguna'"
                    >
                      {{ user.status === 'aktif' ? '⛔' : '✅' }}
                    </button>
                    <button
                      @click="deleteUser(user.id)"
                      class="btn-action btn-delete"
                      title="Hapus Pengguna"
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
        <div v-if="filteredUsers.length > 0" class="table-footer">
          <span class="text-sm text-gray-500">
            Menampilkan {{ filteredUsers.length }} dari {{ users.length }} pengguna
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { userApi } from '../../api'

// ========================================
// STATE
// ========================================
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')

// ========================================
// COMPUTED
// ========================================
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      (user.nama || user.name || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query)
    )
  }

  // Filter by role
  if (filterRole.value) {
    filtered = filtered.filter(user => user.role === filterRole.value)
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(user => user.status === filterStatus.value)
  }

  return filtered
})

// ========================================
// METHODS
// ========================================
const getUserInitial = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

const getRoleIcon = (role) => {
  const map = {
    'admin': '🛡️',
    'nelayan': '⚓',
    'pembeli': '🛒'
  }
  return map[role] || '👤'
}

const getRoleClass = (role) => {
  const map = {
    'admin': 'role-admin',
    'nelayan': 'role-nelayan',
    'pembeli': 'role-pembeli'
  }
  return map[role] || 'role-user'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const fetchUsers = async () => {
  try {
    loading.value = true
    const res = await userApi.getAll()
    users.value = res.data || []
  } catch (err) {
    console.error('Error fetching users:', err)
    users.value = []
    const message = err.response?.data?.message || 'Gagal memuat data pengguna'
    alert(message)
  } finally {
    loading.value = false
  }
}

const toggleSuspend = async (user) => {
  const action = user.status === 'aktif' ? 'suspend' : 'aktifkan'
  if (!confirm(`⚠️ Yakin ingin ${action} pengguna ${user.nama || user.name}?`)) return

  try {
    loading.value = true
    await userApi.toggleSuspend(user.id)
    await fetchUsers()
  } catch (err) {
    console.error('Error toggling user status:', err)
    const message = err.response?.data?.message || 'Gagal mengubah status pengguna'
    alert(message)
  } finally {
    loading.value = false
  }
}

const deleteUser = async (id) => {
  if (!confirm('⚠️ Yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan!')) return

  try {
    loading.value = true
    await userApi.delete(id)
    await fetchUsers()
  } catch (err) {
    console.error('Error deleting user:', err)
    const message = err.response?.data?.message || 'Gagal menghapus pengguna'
    alert(message)
  } finally {
    loading.value = false
  }
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
  fetchUsers()
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

.user-count {
  background: #1B6CA8;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
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
   FILTER CARD
   ======================================== */
.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
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
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus,
.filter-select:focus {
  border-color: #1B6CA8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 108, 168, 0.1);
}

/* ========================================
   TABLE
   ======================================== */
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

/* ========================================
   USER INFO
   ======================================== */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
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

.user-name {
  font-weight: 500;
}

/* ========================================
   ROLE BADGE
   ======================================== */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
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
   STATUS BADGE
   ======================================== */
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

.status-suspend {
  background: #f8d7da;
  color: #721c24;
}

/* ========================================
   ACTION BUTTONS
   ======================================== */
.action-buttons {
  display: flex;
  gap: 6px;
}

.btn-action {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-suspend {
  background: #fff3cd;
  color: #856404;
}

.btn-suspend:hover {
  background: #856404;
  color: white;
  transform: scale(1.1);
}

.btn-activate {
  background: #d4edda;
  color: #155724;
}

.btn-activate:hover {
  background: #155724;
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

  .filter-grid {
    grid-template-columns: 1fr;
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

  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>