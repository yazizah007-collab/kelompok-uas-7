import { createRouter, createWebHistory } from 'vue-router'

// ========================================
// ROUTE DEFINITIONS
// ========================================
const routes = [
  // ========== PUBLIK ==========
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/LandingPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/auth/LupaPassword.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/artikel',
    name: 'Artikel',
    component: () => import('../views/publik/Artikel.vue')
  },
  {
    path: '/artikel/:id',
    name: 'DetailArtikel',
    component: () => import('../views/publik/DetailArtikel.vue')
  },
  {
    path: '/katalog',
    name: 'Katalog',
    component: () => import('../views/pembeli/Katalog.vue')
  },
  {
    path: '/katalog/:id',
    name: 'DetailProduk',
    component: () => import('../views/pembeli/DetailProduk.vue')
  },

  // ========== ADMIN ==========
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { 
      role: 'admin',
      requiresAuth: true 
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/ManajemenUser.vue'),
    meta: { 
      role: 'admin',
      requiresAuth: true 
    }
  },
  {
    path: '/admin/artikel',
    name: 'AdminArtikel',
    component: () => import('../views/admin/ManajemenArtikel.vue'),
    meta: { 
      role: 'admin',
      requiresAuth: true 
    }
  },

  // ========== NELAYAN ==========
  {
    path: '/nelayan/dashboard',
    name: 'NelayanDashboard',
    component: () => import('../views/nelayan/Dashboard.vue'),
    meta: { 
      role: 'nelayan',
      requiresAuth: true 
    }
  },
  {
    path: '/nelayan/produk',
    name: 'NelayanProduk',
    component: () => import('../views/nelayan/ProdukSaya.vue'),
    meta: { 
      role: 'nelayan',
      requiresAuth: true 
    }
  },
  {
    path: '/nelayan/tambak',
    name: 'NelayanTambak',
    component: () => import('../views/nelayan/TambakSaya.vue'),
    meta: { 
      role: 'nelayan',
      requiresAuth: true 
    }
  },
  {
    path: '/nelayan/panen',
    name: 'NelayanPanen',
    component: () => import('../views/nelayan/SiklusPanen.vue'),
    meta: { 
      role: 'nelayan',
      requiresAuth: true 
    }
  },
  {
    path: '/nelayan/pengeluaran',
    name: 'NelayanPengeluaran',
    component: () => import('../views/nelayan/Pengeluaran.vue'),
    meta: { 
      role: 'nelayan',
      requiresAuth: true 
    }
  },
  {
    path: '/nelayan/monitoring',
    name: 'NelayanMonitoring',
    component: () => import('../views/nelayan/MonitoringAir.vue'),
    meta: { 
      role: 'nelayan',
      requiresAuth: true 
    }
  },

  {
    path: '/nelayan/orders',
    name: 'NelayanOrders',
    component: () => import('../views/nelayan/OrderMasuk.vue'),
    meta: { 
      role: 'nelayan',
      requiresAuth: true 
    }
  },

  // ========== PEMBELI ==========
  {
    path: '/keranjang',
    name: 'Keranjang',
    component: () => import('../views/pembeli/Keranjang.vue'),
    meta: { 
      role: 'pembeli',
      requiresAuth: true 
    }
  },
  {
    path: '/orders',
    name: 'RiwayatOrder',
    component: () => import('../views/pembeli/RiwayatOrder.vue'),
    meta: { 
      role: 'pembeli',
      requiresAuth: true 
    }
  },

  // ========== 404 NOT FOUND ==========
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

// ========================================
// ROLE DASHBOARD MAPPING
// ========================================
const roleDashboards = {
  admin: '/admin/dashboard',
  nelayan: '/nelayan/dashboard',
  pembeli: '/katalog'
}

// ========================================
// CREATE ROUTER
// ========================================
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ========================================
// NAVIGATION GUARD
// ========================================
router.beforeEach((to, from, next) => {
  // Ambil token dan user dari localStorage
  const token = localStorage.getItem('token')
  let user = {}
  
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {
    console.error('Error parsing user data:', e)
    user = {}
  }

  // ===== CEK AUTH =====
  const requiresAuth = to.meta.requiresAuth || false
  const guestOnly = to.meta.guestOnly || false
  const requiredRole = to.meta.role || null

  // Jika halaman membutuhkan auth tapi tidak ada token
  if (requiresAuth && !token) {
    return next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    })
  }

  // Jika halaman untuk guest (login/register) tapi sudah login
  if (guestOnly && token) {
    const role = user.role || 'pembeli'
    return next(roleDashboards[role] || '/')
  }

  // ===== CEK ROLE =====
  if (requiredRole && token) {
    // Jika role tidak sesuai
    if (requiredRole !== user.role) {
      const role = user.role || 'pembeli'
      return next(roleDashboards[role] || '/')
    }
  }

  // ===== TAMBAHAN: Validasi token expired =====
  // Jika token ada tapi user tidak valid, redirect ke login
  if (token && !user.role) {
    // Coba refresh token atau redirect ke login
    console.warn('User data tidak lengkap, redirect ke login')
    return next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    })
  }

  // Lanjutkan
  next()
})

// ========================================
// AFTER EACH - Analytics / Logging (Opsional)
// ========================================
router.afterEach((to, from) => {
  // Log page view untuk analytics
  // console.log(`Navigasi dari ${from.path} ke ${to.path}`)
  
  // Update document title
  if (to.meta.title) {
    document.title = `${to.meta.title} | LautKu`
  }
})

// ========================================
// EXPORT
// ========================================
export default router