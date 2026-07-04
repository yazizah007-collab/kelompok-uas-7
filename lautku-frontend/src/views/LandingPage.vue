<template>
  <div class="landing">
    <!-- ============================================ -->
    <!-- HERO SECTION -->
    <!-- ============================================ -->
    <section class="hero">
      <div class="container">
        <div class="hero-wrapper">
          <div class="hero-content">
            <span class="hero-badge">🚀 Platform Terpercaya</span>
            <h1>Platform Marketplace & Manajemen Hasil Laut</h1>
            <p class="hero-desc">
              Menghubungkan nelayan dengan pembeli secara langsung. 
              Kelola tambak, pantau kualitas air, dan jual hasil laut dengan mudah.
            </p>
            <div class="hero-buttons">
              <router-link
                v-if="!authStore.isLoggedIn"
                to="/register"
                class="btn btn-primary btn-lg"
              >
                Daftar Sekarang
                <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
              <router-link
                v-else
                :to="dashboardPath"
                class="btn btn-primary btn-lg"
              >
                Ke Dashboard
                <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
              <router-link to="/katalog" class="btn btn-outline btn-lg">
                Lihat Produk
              </router-link>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">500+</span>
                <span class="stat-label">Nelayan Terdaftar</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">1.2K+</span>
                <span class="stat-label">Produk Terjual</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">98%</span>
                <span class="stat-label">Kepuasan Pelanggan</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="visual-circle">
              <span class="visual-icon">🐟</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- FEATURES SECTION -->
    <!-- ============================================ -->
    <section class="features">
      <div class="container">
        <div class="section-head">
          <span class="section-badge">✨ Fitur Unggulan</span>
          <h2>Solusi Lengkap untuk Ekosistem Laut</h2>
          <p class="section-desc">Semua yang Anda butuhkan dalam satu platform terintegrasi</p>
        </div>

        <div class="features-grid">
          <div v-for="item in features" :key="item.icon" class="feature-card">
            <div class="feature-icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- CTA SECTION -->
    <!-- ============================================ -->
    <section class="cta" v-if="!authStore.isLoggedIn">
      <div class="container">
        <div class="cta-box">
          <h2>Siap Bergabung dengan LautKu?</h2>
          <p>Mulai sekarang dan jadilah bagian dari ekosistem blue economy yang berkelanjutan.</p>
          <div class="cta-buttons">
            <router-link to="/register" class="btn btn-white btn-lg">
              Daftar Gratis
              <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
            <router-link to="/katalog" class="btn btn-outline-white btn-lg">
              Jelajahi Produk
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const dashboardPath = computed(() => {
  const role = authStore.role
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'nelayan') return '/nelayan/dashboard'
  return '/katalog'
})

const features = [
  {
    icon: '🐟',
    title: 'Marketplace Hasil Laut',
    desc: 'Beli hasil laut segar langsung dari nelayan dengan harga terbaik dan kualitas terjamin.'
  },
  {
    icon: '🌾',
    title: 'Manajemen Tambak',
    desc: 'Kelola data tambak, siklus panen, dan pengeluaran operasional secara terpusat.'
  },
  {
    icon: '💧',
    title: 'Monitoring Kualitas Air',
    desc: 'Pantau pH, suhu, salinitas, dan oksigen tambak secara berkala dan real-time.'
  },
  {
    icon: '📊',
    title: 'Analisis & Laporan',
    desc: 'Dapatkan insight dari data tambak, penjualan, dan pengeluaran untuk pengambilan keputusan.'
  },
  {
    icon: '📦',
    title: 'Manajemen Order',
    desc: 'Kelola pesanan dari pembeli dengan sistem yang terintegrasi dan mudah digunakan.'
  },
  {
    icon: '📰',
    title: 'Edukasi & Informasi',
    desc: 'Akses artikel edukasi seputar budidaya, pemasaran, dan teknologi kelautan.'
  }
]
</script>

<style scoped>
/* ==============================================
   VARIABLES
   ============================================== */
:root {
  --primary: #1B6CA8;
  --primary-dark: #154f7a;
  --primary-light: #e8f4fd;
  --dark: #1a1a2e;
  --gray: #6c757d;
  --gray-light: #f8f9fa;
  --white: #ffffff;
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  --radius: 12px;
  --transition: 0.3s ease;
}

/* ==============================================
   CONTAINER
   ============================================== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ==============================================
   BUTTONS
   ============================================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
  cursor: pointer;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}
.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(27, 108, 168, 0.3);
}

.btn-lg { padding: 14px 32px; font-size: 16px; }

.btn-outline {
  background: transparent;
  color: var(--white);
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.btn-outline:hover {
  background: var(--white);
  color: var(--primary);
  border-color: var(--white);
  transform: translateY(-2px);
}

.btn-white {
  background: var(--white);
  color: var(--primary);
}
.btn-white:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}

.btn-outline-white {
  background: transparent;
  color: var(--white);
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.btn-outline-white:hover {
  background: var(--white);
  color: var(--dark);
  border-color: var(--white);
  transform: translateY(-2px);
}

.icon-arrow {
  width: 20px;
  height: 20px;
}

/* ==============================================
   HERO
   ============================================== */
.hero {
  background: linear-gradient(135deg, #1B6CA8 0%, #00b4d8 100%);
  padding: 80px 0;
  min-height: 600px;
  display: flex;
  align-items: center;
}

.hero-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-content { color: var(--white); }

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.hero-content h1 {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
}

.hero-desc {
  font-size: 17px;
  opacity: 0.9;
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 480px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stat-item { display: flex; flex-direction: column; }
.stat-number { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 14px; opacity: 0.7; }
.stat-divider { width: 2px; height: 36px; background: rgba(255, 255, 255, 0.15); }

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.visual-circle {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.visual-icon { font-size: 120px; }

/* ==============================================
   FEATURES
   ============================================== */
.features {
  padding: 80px 0;
  background: var(--gray-light);
}

.section-head {
  text-align: center;
  margin-bottom: 56px;
}

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
}

.section-head h2 {
  font-size: 34px;
  color: var(--dark);
  margin-bottom: 8px;
}

.section-desc {
  font-size: 16px;
  color: var(--gray);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 32px;
  text-align: center;
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
.feature-icon { font-size: 40px; margin-bottom: 12px; }
.feature-card h3 { font-size: 17px; color: var(--dark); margin-bottom: 6px; }
.feature-card p { font-size: 14px; color: var(--gray); line-height: 1.6; }

/* ==============================================
   CTA
   ============================================== */
.cta {
  padding: 80px 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #1B6CA8 100%);
}

.cta-box {
  text-align: center;
  color: var(--white);
}
.cta-box h2 { font-size: 36px; margin-bottom: 12px; }
.cta-box p { font-size: 17px; opacity: 0.8; margin-bottom: 32px; }
.cta-buttons { display: flex; gap: 16px; justify-content: center; }

/* ==============================================
   RESPONSIVE
   ============================================== */
@media (max-width: 992px) {
  .hero-wrapper { grid-template-columns: 1fr; text-align: center; }
  .hero-desc { max-width: 100%; }
  .hero-buttons { justify-content: center; }
  .hero-stats { justify-content: center; }
  .visual-circle { width: 200px; height: 200px; }
  .visual-icon { font-size: 80px; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero { padding: 60px 0; }
  .hero-content h1 { font-size: 28px; }
  .hero-buttons { flex-direction: column; align-items: center; }
  .hero-stats { flex-direction: column; gap: 12px; }
  .stat-divider { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .section-head h2 { font-size: 26px; }
  .cta-box h2 { font-size: 26px; }
  .cta-buttons { flex-direction: column; align-items: center; }
}

@media (max-width: 480px) {
  .hero-content h1 { font-size: 24px; }
  .btn-lg { padding: 12px 24px; font-size: 14px; }
  .visual-circle { width: 160px; height: 160px; }
  .visual-icon { font-size: 60px; }
}
</style>