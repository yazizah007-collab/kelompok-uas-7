<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Side - Branding -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-logo">
            <img src="/logo.png" alt="LautKu" class="logo-image" />
            <h1 class="brand-title">LautKu</h1>
          </div>
          <p class="brand-subtitle">Platform Jual Beli Hasil Laut</p>
          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-icon">🐟</span>
              <span>Hasil Laut Segar</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⚓</span>
              <span>Nelayan Terpercaya</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🛒</span>
              <span>Belanja Mudah</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="login-form-wrapper">
        <div class="login-card">
          <div class="login-header">
            <h2>Selamat Datang Kembali</h2>
            <p>Masuk ke akun LautKu Anda</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label>📧 Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="Masukkan email Anda"
                required
                :class="{ 'input-error': errors.email }"
                @blur="validateField('email')"
              />
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label>🔒 Password</label>
              <div class="password-wrapper">
                <input 
                  v-model="form.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Masukkan password Anda"
                  required
                  :class="{ 'input-error': errors.password }"
                  @blur="validateField('password')"
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="rememberMe" />
                <span>Ingat saya</span>
              </label>
              <router-link to="/forgot-password" class="forgot-link">
                Lupa password?
              </router-link>
            </div>

            <div v-if="error" class="error-message">
              <span>❌</span>
              {{ error }}
            </div>

            <button type="submit" class="btn btn-primary btn-login" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Memproses...' : '🚀 Masuk' }}
            </button>
          </form>

          <div class="login-footer">
            <p>
              Belum punya akun? 
              <router-link to="/register" class="register-link">Daftar di sini</router-link>
            </p>
            <router-link to="/" class="back-home">🏠 Kembali ke Beranda</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ========================================
// STATE
// ========================================
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const errors = ref({
  email: '',
  password: ''
})

// ========================================
// METHODS
// ========================================
const validateField = (field) => {
  if (field === 'email') {
    if (!form.value.email) {
      errors.value.email = 'Email wajib diisi'
    } else if (!isValidEmail(form.value.email)) {
      errors.value.email = 'Format email tidak valid'
    } else {
      errors.value.email = ''
    }
  }
  
  if (field === 'password') {
    if (!form.value.password) {
      errors.value.password = 'Password wajib diisi'
    } else if (form.value.password.length < 6) {
      errors.value.password = 'Password minimal 6 karakter'
    } else {
      errors.value.password = ''
    }
  }
}

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleLogin = async () => {
  // Validate all fields
  validateField('email')
  validateField('password')
  
  if (errors.value.email || errors.value.password) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Gunakan authStore untuk login
    await authStore.login(form.value)
    
    // Jika remember me, simpan di localStorage
    if (rememberMe.value) {
      localStorage.setItem('rememberEmail', form.value.email)
    } else {
      localStorage.removeItem('rememberEmail')
    }

    // Redirect berdasarkan role
    const role = authStore.user?.role
    const redirectPath = route.query.redirect || getDashboardPath(role)
    router.push(redirectPath)

  } catch (err) {
    error.value = err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.'
  } finally {
    loading.value = false
  }
}

const getDashboardPath = (role) => {
  const map = {
    'admin': '/admin/dashboard',
    'nelayan': '/nelayan/dashboard',
    'pembeli': '/katalog'
  }
  return map[role] || '/'
}

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
  // Auto-fill email jika remember me
  const rememberedEmail = localStorage.getItem('rememberEmail')
  if (rememberedEmail) {
    form.value.email = rememberedEmail
    rememberMe.value = true
  }
})
</script>

<style scoped>
/* ========================================
   LAYOUT
   ======================================== */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1B6CA8 0%, #00b4d8 100%);
  padding: 20px;
}

.login-container {
  display: flex;
  max-width: 1000px;
  width: 100%;
  min-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* ========================================
   LEFT SIDE - BRANDING
   ======================================== */
.login-brand {
  flex: 1;
  background: linear-gradient(135deg, #1B6CA8 0%, #154f7a 100%);
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  min-width: 300px;
}

.brand-content {
  text-align: center;
  max-width: 320px;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.logo-image {
  width: 56px;
  height: 56px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 32px;
  font-weight: 300;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.feature-icon {
  font-size: 24px;
}

/* ========================================
   RIGHT SIDE - LOGIN FORM
   ======================================== */
.login-form-wrapper {
  flex: 1;
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  min-width: 320px;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.login-header {
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.login-header p {
  color: #6c757d;
  font-size: 15px;
  margin: 0;
}

/* ========================================
   FORM
   ======================================== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus {
  border-color: #1B6CA8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 108, 168, 0.1);
}

.form-group .input-error {
  border-color: #e74c3c;
}

.form-group .input-error:focus {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
}

.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.password-toggle:hover {
  opacity: 1;
}

/* ========================================
   FORM OPTIONS
   ======================================== */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1B6CA8;
}

.forgot-link {
  color: #1B6CA8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #154f7a;
  text-decoration: underline;
}

/* ========================================
   ERROR MESSAGE
   ======================================== */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #f5c6cb;
}

/* ========================================
   BUTTON
   ======================================== */
.btn-login {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: #1B6CA8;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-login:hover:not(:disabled) {
  background: #154f7a;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(27, 108, 168, 0.3);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ========================================
   SPINNER
   ======================================== */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========================================
   FOOTER
   ======================================== */
.login-footer {
  margin-top: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-footer p {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.register-link {
  color: #1B6CA8;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.register-link:hover {
  color: #154f7a;
  text-decoration: underline;
}

.back-home {
  color: #6c757d;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.back-home:hover {
  color: #1B6CA8;
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    min-height: auto;
    max-height: none;
  }

  .login-brand {
    padding: 32px 24px;
    min-width: auto;
  }

  .brand-logo {
    gap: 12px;
  }

  .logo-image {
    width: 44px;
    height: 44px;
  }

  .brand-title {
    font-size: 28px;
  }

  .brand-features {
    display: none;
  }

  .login-form-wrapper {
    padding: 32px 24px;
    min-width: auto;
  }

  .login-header h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .login-brand {
    padding: 24px 16px;
  }

  .brand-title {
    font-size: 24px;
  }

  .brand-subtitle {
    font-size: 14px;
  }

  .login-form-wrapper {
    padding: 24px 16px;
  }

  .login-header h2 {
    font-size: 20px;
  }

  .form-options {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>