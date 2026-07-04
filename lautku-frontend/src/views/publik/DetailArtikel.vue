<template>
  <div class="page-detail-artikel">
    <!-- Back Button -->
    <router-link to="/artikel" class="back-link">← Kembali ke Artikel</router-link>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat artikel...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-icon">😞</p>
      <p class="error-text">{{ error }}</p>
      <button class="btn btn-primary" @click="fetchArtikel">Coba Lagi</button>
    </div>

    <!-- Article Detail -->
    <div class="artikel-detail" v-else-if="artikel">
      <!-- Header -->
      <div class="artikel-header">
        <span class="kategori-badge">{{ artikel.kategori || 'Umum' }}</span>
        <h1>{{ artikel.judul }}</h1>
        <div class="artikel-meta">
          <span class="artikel-date">📅 {{ formatDate(artikel.created_at || artikel.createdAt) }}</span>
          <span class="artikel-read-time" v-if="artikel.konten">
            ⏱️ {{ estimateReadTime(artikel.konten) }} menit baca
          </span>
        </div>
      </div>

      <!-- Featured Image -->
      <div class="artikel-featured-image" v-if="artikel.gambar">
        <img
          :src="artikel.gambar"
          :alt="artikel.judul"
          @error="handleImageError"
        />
      </div>

      <!-- Content -->
      <div class="artikel-konten">
        <p v-for="(paragraph, index) in artikel.konten.split('\n')" :key="index">
          {{ paragraph }}
        </p>
      </div>

      <!-- Tags / Kategori -->
      <div class="artikel-tags" v-if="artikel.kategori">
        <span class="tag-label">🏷️ Kategori:</span>
        <span class="tag">{{ artikel.kategori }}</span>
      </div>

      <!-- Share Section -->
      <div class="share-section">
        <p class="share-label">📤 Bagikan artikel ini:</p>
        <div class="share-buttons">
          <button class="share-btn" @click="shareArticle('facebook')">📘 Facebook</button>
          <button class="share-btn" @click="shareArticle('twitter')">🐦 Twitter</button>
          <button class="share-btn" @click="shareArticle('whatsapp')">💬 WhatsApp</button>
          <button class="share-btn" @click="copyLink">🔗 Copy Link</button>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="empty-state">
      <p class="empty-icon">📰</p>
      <p class="empty-text">Artikel tidak ditemukan</p>
      <router-link to="/artikel" class="btn btn-primary">Lihat Artikel Lain</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { artikelApi } from '../../api'

const route = useRoute()
const artikel = ref(null)
const loading = ref(true)
const error = ref('')

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const estimateReadTime = (text) => {
  if (!text) return 1
  const wordCount = text.split(/\s+/).length
  return Math.max(Math.ceil(wordCount / 200), 1)
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const fetchArtikel = async () => {
  try {
    loading.value = true
    error.value = ''
    const id = route.params.id
    const res = await artikelApi.getById(id)
    artikel.value = res.data || null
  } catch (err) {
    console.error('Error fetching article:', err)
    if (err.response?.status === 404) {
      error.value = 'Artikel tidak ditemukan'
    } else {
      error.value = err.response?.data?.message || 'Gagal memuat artikel. Silakan coba lagi.'
    }
    artikel.value = null
  } finally {
    loading.value = false
  }
}

const shareArticle = (platform) => {
  const url = window.location.href
  const title = artikel.value?.judul || 'Artikel LautKu'
  let shareUrl = ''

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      break
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
      break
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
      break
  }

  if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=500')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('✅ Link artikel berhasil disalin!')
  } catch {
    alert('Gagal menyalin link. Silakan copy manual.')
  }
}

onMounted(() => {
  fetchArtikel()
})
</script>

<style scoped>
.page-detail-artikel {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.back-link {
  color: #1B6CA8;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 24px;
  transition: color 0.2s;
}
.back-link:hover { color: #154f7a; text-decoration: underline; }

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

.error-state { text-align: center; padding: 60px 20px; }
.error-icon { font-size: 48px; margin-bottom: 16px; }
.error-text { font-size: 16px; color: #6c757d; margin-bottom: 20px; }

.artikel-detail { margin-top: 8px; }

.artikel-header { margin-bottom: 24px; }

.kategori-badge {
  background: #e8f4fd;
  color: #1B6CA8;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.artikel-header h1 {
  font-size: 32px;
  color: #1a1a2e;
  margin: 16px 0 12px;
  line-height: 1.3;
}

.artikel-meta { display: flex; gap: 20px; flex-wrap: wrap; }
.artikel-date,
.artikel-read-time { color: #6c757d; font-size: 14px; }

.artikel-featured-image {
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
}
.artikel-featured-image img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
}

.artikel-konten {
  font-size: 17px;
  line-height: 1.9;
  color: #1a1a2e;
  margin: 24px 0;
}
.artikel-konten p { margin-bottom: 16px; }

.artikel-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 16px 0;
  border-top: 1px solid #f0f8ff;
  border-bottom: 1px solid #f0f8ff;
  margin: 24px 0;
}
.tag-label { font-size: 14px; font-weight: 600; color: #1a1a2e; }
.tag {
  background: #e8f4fd;
  color: #1B6CA8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.share-section { margin: 24px 0; }
.share-label { font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 12px; }
.share-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
.share-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  cursor: pointer;
  transition: all 0.3s ease;
}
.share-btn:hover {
  border-color: #1B6CA8;
  background: #e8f4fd;
  color: #1B6CA8;
  transform: translateY(-2px);
}

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; }

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
.btn-primary { background: #1B6CA8; color: white; }
.btn-primary:hover { background: #154f7a; transform: translateY(-2px); }

@media (max-width: 768px) {
  .artikel-header h1 { font-size: 24px; }
  .artikel-meta { flex-direction: column; gap: 8px; }
  .artikel-konten { font-size: 15px; line-height: 1.8; }
  .share-buttons { flex-direction: column; }
  .share-btn { width: 100%; justify-content: center; }
  .artikel-featured-image img { max-height: 250px; }
}
@media (max-width: 480px) {
  .artikel-header h1 { font-size: 20px; }
  .artikel-konten { font-size: 14px; }
}
</style>