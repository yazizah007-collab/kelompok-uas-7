<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo">
        <img src="/logo.png" alt="LautKu" class="logo-img" />
        <span class="logo-text">LautKu</span>
      </router-link>

      <!-- Desktop Menu -->
      <div class="nav-menu">
        <router-link to="/katalog" class="nav-link">Katalog</router-link>
        <router-link to="/artikel" class="nav-link">Artikel</router-link>

        <!-- Sudah login -->
        <template v-if="authStore.isLoggedIn">
          <router-link
            v-if="authStore.role === 'admin' || authStore.role === 'nelayan'"
            :to="dashboardPath"
            class="nav-link nav-dashboard"
          >
            📊 Dashboard
          </router-link>
          <router-link
            v-if="authStore.role === 'pembeli'"
            to="/keranjang"
            class="nav-link"
          >
            🛒 Keranjang
            <span v-if="jumlahKeranjang > 0" class="cart-badge">{{ jumlahKeranjang }}</span>
          </router-link>
          <router-link
            v-if="authStore.role === 'pembeli'"
            to="/orders"
            class="nav-link"
          >
            📦 Pesanan
          </router-link>
          <span class="user-greeting">{{ userName }}</span>
          <button class="btn btn-logout" @click="handleLogout">Logout</button>
        </template>

        <!-- Belum login -->
        <template v-else>
          <router-link to="/login" class="btn btn-outline-primary">Masuk</router-link>
          <router-link to="/register" class="btn btn-primary">Daftar</router-link>
        </template>
      </div>

      <!-- Hamburger -->
      <button class="hamburger" @click="mobileOpen = !mobileOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileOpen" class="mobile-menu">
      <router-link to="/katalog" class="mobile-link" @click="mobileOpen = false">Katalog</router-link>
      <router-link to="/artikel" class="mobile-link" @click="mobileOpen = false">Artikel</router-link>

      <template v-if="authStore.isLoggedIn">
        <router-link
          v-if="authStore.role === 'admin' || authStore.role === 'nelayan'"
          :to="dashboardPath"
          class="mobile-link"
          @click="mobileOpen = false"
        >
          📊 Dashboard
        </router-link>
        <router-link
          v-if="authStore.role === 'pembeli'"
          to="/keranjang"
          class="mobile-link"
          @click="mobileOpen = false"
        >
          🛒 Keranjang
        </router-link>
        <router-link
          v-if="authStore.role === 'pembeli'"
          to="/orders"
          class="mobile-link"
          @click="mobileOpen = false"
        >
          📦 Pesanan
        </router-link>
        <div class="mobile-divider"></div>
        <span class="mobile-user">{{ userName }}</span>
        <button class="btn btn-logout mobile-btn" @click="handleLogout">Logout</button>
      </template>

      <template v-else>
        <div class="mobile-divider"></div>
        <router-link to="/login" class="mobile-link" @click="mobileOpen = false">Masuk</router-link>
        <router-link to="/register" class="btn btn-primary mobile-btn" @click="mobileOpen = false">Daftar</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const mobileOpen = ref(false)
const jumlahKeranjang = ref(0)

const userName = computed(() => {
  const u = authStore.user
  return u?.nama || u?.name || u?.username || 'User'
})

const dashboardPath = computed(() => {
  const role = authStore.role
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'nelayan') return '/nelayan/dashboard'
  return '/'
})

const handleLogout = async () => {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    await authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  if (authStore.isLoggedIn && authStore.role === 'pembeli') {
    try {
      const { orderApi } = await import('@/api')
      const res = await orderApi.getKeranjang()
      const items = res.data || []
      jumlahKeranjang.value = items.reduce((total, item) => total + (item.jumlah || 1), 0)
    } catch {
      jumlahKeranjang.value = 0
    }
  }
})
</script>

<style scoped>
.navbar {
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  position: sticky;
  top: 0;
  z-index: 999;
  width: 100%;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1B6CA8;
}

/* Desktop nav */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  padding: 6px 14px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.nav-link:hover { color: #1B6CA8; background: #EFF6FF; }
.nav-link.router-link-active { color: #1B6CA8; font-weight: 600; }

.nav-dashboard {
  color: #1B6CA8;
  background: #EFF6FF;
}
.nav-dashboard:hover { background: #DBEAFE; }

/* Cart Badge */
.cart-badge {
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  min-width: 18px;
  text-align: center;
}

.user-greeting {
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  padding: 0 8px;
  border-left: 1px solid #E5E7EB;
  margin-left: 4px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 0.2s ease;
}
.btn-primary { background: #1B6CA8; color: white; margin-left: 4px; }
.btn-primary:hover { background: #154f7a; transform: translateY(-1px); }
.btn-outline-primary {
  background: transparent;
  color: #1B6CA8;
  border: 1.5px solid #1B6CA8;
}
.btn-outline-primary:hover { background: #EFF6FF; }
.btn-logout { background: #FEE2E2; color: #DC2626; margin-left: 4px; }
.btn-logout:hover { background: #FECACA; }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}
.hamburger span {
  width: 22px;
  height: 2px;
  background: #374151;
  border-radius: 2px;
  display: block;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 12px 16px 16px;
  border-top: 1px solid #F3F4F6;
  gap: 4px;
}
.mobile-link {
  padding: 10px 12px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.mobile-link:hover { background: #EFF6FF; color: #1B6CA8; }
.mobile-link.router-link-active { color: #1B6CA8; font-weight: 600; }
.mobile-divider {
  height: 1px;
  background: #F3F4F6;
  margin: 8px 0;
}
.mobile-user {
  padding: 8px 12px;
  font-size: 13px;
  color: #6B7280;
}
.mobile-btn {
  margin-top: 4px;
  width: 100%;
}

@media (max-width: 768px) {
  .nav-menu { display: none; }
  .hamburger { display: flex; }
  .mobile-menu { display: flex; }
}
</style>