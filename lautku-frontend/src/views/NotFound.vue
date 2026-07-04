<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div class="text-9xl font-bold text-[#1B6CA8] mb-4">404</div>
    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h1>
    <p class="text-gray-500 text-lg mb-8 max-w-md">
      Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
    </p>
    <div class="flex flex-col sm:flex-row gap-4">
      <router-link 
        to="/" 
        class="px-6 py-3 bg-[#1B6CA8] text-white rounded-lg hover:bg-[#154f7a] transition shadow-md hover:shadow-lg"
      >
        🏠 Kembali ke Beranda
      </router-link>
      <router-link 
        to="/katalog" 
        class="px-6 py-3 border-2 border-[#1B6CA8] text-[#1B6CA8] rounded-lg hover:bg-[#1B6CA8] hover:text-white transition"
      >
        🐟 Lihat Katalog
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Tidak ada logic khusus
</script>

<style scoped>
/* Style tambahan jika diperlukan */
</style>