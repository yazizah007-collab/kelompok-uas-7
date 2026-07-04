<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="flex items-center space-x-2">
        <img src="/logo.png" alt="LautKu" class="h-10 w-auto" />
        <h2 class="text-xl font-bold text-white">LautKu</h2>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- Admin Menu -->
      <template v-if="userRole === 'admin'">
        <router-link to="/admin/dashboard" class="nav-link"><span class="nav-icon">📊</span> Dashboard</router-link>
        <router-link to="/admin/users" class="nav-link"><span class="nav-icon">👥</span> Pengguna</router-link>
        <router-link to="/admin/artikel" class="nav-link"><span class="nav-icon">📰</span> Artikel</router-link>
      </template>

      <!-- Nelayan Menu -->
      <template v-if="userRole === 'nelayan'">
        <router-link to="/nelayan/dashboard" class="nav-link"><span class="nav-icon">📊</span> Dashboard</router-link>
        <router-link to="/nelayan/produk" class="nav-link"><span class="nav-icon">🐟</span> Produk Saya</router-link>
        <router-link to="/nelayan/tambak" class="nav-link"><span class="nav-icon">🌾</span> Tambak</router-link>
        <router-link to="/nelayan/panen" class="nav-link"><span class="nav-icon">🌿</span> Siklus Panen</router-link>
        <router-link to="/nelayan/pengeluaran" class="nav-link"><span class="nav-icon">💰</span> Pengeluaran</router-link>
        <router-link to="/nelayan/monitoring" class="nav-link"><span class="nav-icon">💧</span> Monitoring Air</router-link>
        <router-link to="/nelayan/orders" class="nav-link"><span class="nav-icon">📦</span> Order Masuk</router-link>
      </template>

      <!-- Pembeli Menu -->
      <template v-if="userRole === 'pembeli'">
        <router-link to="/katalog" class="nav-link"><span class="nav-icon">🐟</span> Katalog</router-link>
        <router-link to="/keranjang" class="nav-link"><span class="nav-icon">🛒</span> Keranjang</router-link>
        <router-link to="/orders" class="nav-link"><span class="nav-icon">📦</span> Pesanan Saya</router-link>
      </template>
    </nav>

    <!-- User Info & Logout -->
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-detail">
          <p class="user-name">{{ userName }}</p>
          <p class="user-role">{{ userRole || 'Guest' }}</p>
        </div>
      </div>
      <button class="logout-btn" @click="handleLogout"><span>🚪</span> Logout</button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const userRole = computed(() => user.value?.role || '')
const userName = computed(() => user.value?.name || user.value?.nama || 'User')
const userInitial = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})

const handleLogout = () => {
  if (confirm('⚠️ Apakah Anda yakin ingin logout?')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: linear-gradient(180deg, #1B6CA8 0%, #154f7a 100%);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.sidebar-logo {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.sidebar-logo h2 {
  color: white;
  font-size: 20px;
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.25s ease;
  text-decoration: none;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateX(4px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.18);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-link.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: white;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.user-detail {
  flex: 1;
  min-width: 0;
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin: 0;
  text-transform: capitalize;
}

.logout-btn {
  width: 100%;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.25s ease;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.3);
  color: white;
}

.logout-btn:active {
  transform: scale(0.97);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }
  .sidebar-logo {
    padding: 16px 8px;
    text-align: center;
  }
  .sidebar-logo h2 {
    display: none;
  }
  .sidebar-logo img {
    margin: 0 auto;
  }
  .nav-link {
    padding: 12px;
    justify-content: center;
    font-size: 0;
  }
  .nav-link span:not(.nav-icon) {
    display: none;
  }
  .nav-icon {
    font-size: 22px;
    width: auto;
  }
  .nav-link.router-link-active::before {
    display: none;
  }
  .user-info {
    flex-direction: column;
    padding: 8px;
  }
  .user-detail {
    display: none;
  }
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  .logout-btn {
    justify-content: center;
    padding: 10px;
    font-size: 0;
  }
  .logout-btn span {
    font-size: 20px;
  }
}
</style>