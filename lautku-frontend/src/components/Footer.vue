<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="brand">
            <img src="/logo.png" alt="LautKu" class="brand-logo" />
            <span>LautKu</span>
          </div>
          <p>Platform jual beli hasil laut dari nelayan langsung ke pembeli.</p>
          <div class="social-links">
            <a href="#" class="social-link">📘</a>
            <a href="#" class="social-link">📸</a>
            <a href="#" class="social-link">🐦</a>
            <a href="#" class="social-link">▶️</a>
          </div>
        </div>

        <!-- Links -->
        <div class="footer-links">
          <div class="footer-column">
            <h4>Menu</h4>
            <router-link to="/katalog">Katalog</router-link>
            <router-link to="/artikel">Artikel</router-link>

            <!-- Belum login -->
            <template v-if="!authStore.isLoggedIn">
              <router-link to="/login">Login</router-link>
              <router-link to="/register">Daftar</router-link>
            </template>

            <!-- Sudah login -->
            <template v-else>
              <router-link
                v-if="authStore.role === 'admin' || authStore.role === 'nelayan'"
                :to="dashboardPath"
              >
                Dashboard
              </router-link>
              <router-link v-if="authStore.role === 'pembeli'" to="/keranjang">
                Keranjang
              </router-link>
              <router-link v-if="authStore.role === 'pembeli'" to="/orders">
                Pesanan Saya
              </router-link>
            </template>
          </div>

          <div class="footer-column">
            <h4>Kontak</h4>
            <a href="mailto:info@lautku.com">📧 info@lautku.com</a>
            <a href="tel:+628123456789">📞 +62 812-3456-789</a>
            <span>📍 Jakarta, Indonesia</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ new Date().getFullYear() }} LautKu. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const dashboardPath = computed(() => {
  const role = authStore.role
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'nelayan') return '/nelayan/dashboard'
  return '/'
})
</script>

<style scoped>
/* ============================================
   FOOTER STYLES
   ============================================ */
.footer {
  background: #1a1a2e;
  color: white;
  padding: 48px 0 24px;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* Brand */
.footer-brand .brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.footer-brand .brand-logo {
  height: 36px;
  width: auto;
  filter: brightness(0) invert(1);
}

.footer-brand .brand span {
  font-size: 20px;
  font-weight: 700;
}

.footer-brand p {
  font-size: 14px;
  opacity: 0.5;
  line-height: 1.7;
  max-width: 300px;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.5);
  transition: 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateY(-2px);
}

/* Footer Links */
.footer-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.footer-column h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: white;
}

.footer-column a,
.footer-column span {
  display: block;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 14px;
  padding: 4px 0;
  transition: 0.3s ease;
}

.footer-column a:hover {
  color: white;
}

/* Footer Bottom */
.footer-bottom {
  text-align: center;
  padding-top: 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .footer-brand p {
    max-width: 100%;
  }
}
</style>