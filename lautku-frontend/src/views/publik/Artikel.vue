<template>
  <div class="page-artikel">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1>📰 Artikel Edukasi</h1>
      <p>Temukan informasi seputar budidaya, pemasaran, dan teknologi kelautan</p>
    </div>

    <!-- Filter & Search -->
    <div class="filter-bar">
      <div class="filter-group">
        <input
          v-model="searchQuery"
          placeholder="🔍 Cari artikel..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <select v-model="filterKategori" class="filter-select">
          <option value="">Semua Kategori</option>
          <option value="Budidaya">🌱 Budidaya</option>
          <option value="Pemasaran">📊 Pemasaran</option>
          <option value="Teknologi">💻 Teknologi</option>
          <option value="Lingkungan">🌍 Lingkungan</option>
          <option value="Resep">🍳 Resep Masakan</option>
          <option value="Berita">📰 Berita</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat artikel...</p>
    </div>

    <!-- Artikel Grid -->
    <div v-else-if="filteredArtikels.length > 0" class="artikel-grid">
      <div
        class="artikel-card"
        v-for="a in filteredArtikels"
        :key="a.id"
        @click="goToDetail(a.id)"
      >
        <div class="artikel-img">
          <img
            :src="a.gambar || '/article-placeholder.png'"
            :alt="a.judul"
            @error="handleImageError"
          />
          <span class="artikel-status" v-if="a.status === 'publish'">📌 Published</span>
        </div>
        <div class="artikel-info">
          <span class="kategori-badge">{{ a.kategori || 'Umum' }}</span>
          <h3>{{ a.judul }}</h3>
          <p>{{ truncateText(a.konten, 120) }}</p>
          <div class="artikel-footer">
            <span class="artikel-date">📅 {{ formatDate(a.created_at || a.createdAt) }}</span>
            <span class="artikel-read">Baca Selengkapnya →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p class="empty-icon">📰</p>
      <p class="empty-text">Tidak ada artikel ditemukan</p>
      <p class="empty-subtext">Coba ubah filter pencarian atau kategori</p>
      <button class="btn btn-outline" @click="resetFilters">Reset Filter</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { artikelApi } from '../../api'

const router = useRouter()
const artikels = ref([])
const searchQuery = ref('')
const filterKategori = ref('')
const loading = ref(true)

const filteredArtikels = computed(() => {
  let filtered = artikels.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.judul.toLowerCase().includes(query) ||
      (a.konten && a.konten.toLowerCase().includes(query)) ||
      (a.kategori && a.kategori.toLowerCase().includes(query))
    )
  }

  if (filterKategori.value) {
    filtered = filtered.filter(a => a.kategori === filterKategori.value)
  }

  return filtered.sort((a, b) => {
    return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
  })
})

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const handleImageError = (e) => {
  e.target.src = '/article-placeholder.png'
}

const goToDetail = (id) => {
  router.push(`/artikel/${id}`)
}

const resetFilters = () => {
  searchQuery.value = ''
  filterKategori.value = ''
}

const fetchArtikel = async () => {
  try {
    loading.value = true
    const res = await artikelApi.getPublished()
    artikels.value = res.data || []
  } catch (err) {
    console.error('Error fetching articles:', err)
    artikels.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchArtikel()
})
</script>

<style scoped>
.page-artikel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.hero-section {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 20px;
  background: linear-gradient(135deg, #e8f4fd, #d1ecf1);
  border-radius: 16px;
}
.hero-section h1 { font-size: 32px; color: #1B6CA8; margin-bottom: 8px; }
.hero-section p { color: #6c757d; font-size: 16px; }

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.filter-group { flex: 1; min-width: 200px; }

.search-input,
.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}
.search-input:focus,
.filter-select:focus {
  border-color: #1B6CA8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 108, 168, 0.1);
}

.loading-state { text-align: center; padding: 60px 20px; color: #6c757d; }
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e8f4fd;
  border-top: 4px solid #1B6CA8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.artikel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.artikel-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.artikel-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.artikel-img {
  background: linear-gradient(135deg, #e8f4fd, #d1ecf1);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.artikel-img img { width: 100%; height: 100%; object-fit: cover; }

.artikel-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: #d4edda;
  color: #155724;
}

.artikel-info { padding: 20px; }

.kategori-badge {
  background: #e8f4fd;
  color: #1B6CA8;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.artikel-info h3 {
  margin: 12px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.artikel-info p {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.artikel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f8ff;
}
.artikel-date { font-size: 12px; color: #6c757d; }
.artikel-read { font-size: 13px; font-weight: 600; color: #1B6CA8; transition: all 0.2s; }
.artikel-card:hover .artikel-read { transform: translateX(4px); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.empty-subtext { font-size: 14px; color: #6c757d; margin-bottom: 20px; }

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
}
.btn-outline { background: transparent; color: #1B6CA8; border: 2px solid #1B6CA8; }
.btn-outline:hover { background: #1B6CA8; color: white; }

@media (max-width: 768px) {
  .hero-section h1 { font-size: 24px; }
  .filter-bar { flex-direction: column; }
  .filter-group { min-width: 100%; }
  .artikel-grid { grid-template-columns: 1fr; }
  .artikel-img { height: 180px; }
}
@media (max-width: 480px) {
  .artikel-img { height: 160px; }
  .artikel-info h3 { font-size: 16px; }
  .artikel-info p { font-size: 13px; }
}
</style>