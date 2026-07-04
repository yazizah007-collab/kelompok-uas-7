<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content dengan Animasi Transisi -->
    <main class="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <router-view v-slot="{ Component, route }">
        <transition
          name="page-fade"
          mode="out-in"
          :key="route.path"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style>
/* ========================================
   RESET DASAR
   ======================================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ========================================
   ANIMASI TRANSISI HALAMAN
   ======================================== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ========================================
   SCROLLBAR CUSTOM (Konsisten dengan tema)
   ======================================== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #1B6CA8;
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #154f7a;
}

/* ========================================
   SCROLLBAR UNTUK FIREFOX
   ======================================== */
* {
  scrollbar-width: thin;
  scrollbar-color: #1B6CA8 #f1f1f1;
}

/* ========================================
   SELECTION COLOR
   ======================================== */
::selection {
  background: #1B6CA8;
  color: white;
}

::-moz-selection {
  background: #1B6CA8;
  color: white;
}

/* ========================================
   FOCUS OUTLINE (Aksesibilitas)
   ======================================== */
:focus-visible {
  outline: 2px solid #1B6CA8;
  outline-offset: 2px;
}

/* ========================================
   LINK DEFAULT
   ======================================== */
a {
  text-decoration: none;
  color: inherit;
}

/* ========================================
   IMAGE DEFAULT
   ======================================== */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* ========================================
   UTILITY - ANIMATION DELAY
   ======================================== */
.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

.delay-300 {
  animation-delay: 300ms;
}

.delay-400 {
  animation-delay: 400ms;
}

.delay-500 {
  animation-delay: 500ms;
}
</style>