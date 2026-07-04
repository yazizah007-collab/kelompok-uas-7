<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Left Side - Branding -->
      <div class="register-brand">
        <div class="brand-content">
          <div class="brand-logo">
            <img src="/logo.png" alt="LautKu" class="logo-image" />
            <h1 class="brand-title">LautKu</h1>
          </div>
          <p class="brand-subtitle">Bergabung dengan Platform Jual Beli Hasil Laut</p>
          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-icon">✅</span>
              <span>Gratis mendaftar</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔒</span>
              <span>Data aman & terpercaya</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🚀</span>
              <span>Mulai jual beli hasil laut</span>
            </div>
          </div>
          <router-link to="/login" class="back-link">
            ← Sudah punya akun? Login
          </router-link>
        </div>
      </div>

      <!-- Right Side - Register Form -->
      <div class="register-form-wrapper">
        <div class="register-card">
          <div class="register-header">
            <h2>Buat Akun Baru</h2>
            <p>Isi data diri Anda untuk mendaftar</p>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group">
              <label>👤 Nama Lengkap <span class="required">*</span></label>
              <input 
                v-model="form.nama" 
                type="text" 
                placeholder="Masukkan nama lengkap"
                required
                :class="{ 'input-error': errors.nama }"
                @blur="validateField('nama')"
              />
              <span v-if="errors.nama" class="error-text">{{ errors.nama }}</span>
            </div>

            <div class="form-group">
              <label>📧 Email <span class="required">*</span></label>
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="Masukkan email aktif"
                required
                :class="{ 'input-error': errors.email }"
                @blur="validateField('email')"
              />
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label>🔒 Password <span class="required">*</span></label>
              <div class="password-wrapper">
                <input 
                  v-model="form.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Minimal 6 karakter"
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
              <div class="password-hint">
                <span :class="form.password.length >= 6 ? 'hint-valid' : 'hint-invalid'">
                  {{ form.password.length >= 6 ? '✅' : '⬜' }} Minimal 6 karakter
                </span>
                <span :class="hasUppercase ? 'hint-valid' : 'hint-invalid'">
                  {{ hasUppercase ? '✅' : '⬜' }} Huruf kapital
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>📱 No. Telepon</label>
              <input 
                v-model="form.telepon" 
                type="tel" 
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div class="form-group">
              <label>🎯 Daftar Sebagai <span class="required">*</span></label>
              <div class="role-selector">
                <button 
                  type="button"
                  :class="['role-btn', form.role === 'pembeli' ? 'active' : '']"
                  @click="form.role = 'pembeli'"
                >
                  🛒 Pembeli
                </button>
                <button 
                  type="button"
                  :class="['role-btn', form.role === 'nelayan' ? 'active' : '']"
                  @click="form.role = 'nelayan'"
                >
                  ⚓ Nelayan
                </button>
              </div>
            </div>

            <div class="form-group terms">
              <label class="checkbox-label">
                <input type="checkbox" v-model="agreeTerms" required />
                <span>
                  Saya setuju dengan 
                  <a href="#" @click.prevent="showTerms = true">Syarat & Ketentuan</a>
                  dan 
                  <a href="#" @click.prevent="showPrivacy = true">Kebijakan Privasi</a>
                </span>
              </label>
            </div>

            <div v-if="error" class="error-message">
              <span>❌</span>
              {{ error }}
            </div>
            <div v-if="success" class="success-message">
              <span>✅</span>
              {{ success }}
            </div>

            <button type="submit" class="btn btn-primary btn-register" :disabled="loading || !agreeTerms">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Memproses...' : '🚀 Daftar Sekarang' }}
            </button>
          </form>

          <div class="register-footer">
            <p>
              Sudah punya akun? 
              <router-link to="/login" class="login-link">Login di sini</router-link>
            </p>
            <router-link to="/" class="back-home">🏠 Kembali ke Beranda</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../../api'

// ========================================
// STATE
// ========================================
const router = useRouter()
const form = ref({
  nama: '',
  email: '',
  password: '',
  telepon: '',
  role: 'pembeli'
})
const error = ref('')
const success = ref('')
const loading = ref(false)
const showPassword = ref(false)
const agreeTerms = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

const errors = ref({
  nama: '',
  email: '',
  password: ''
})

// ========================================
// COMPUTED
// ========================================
const hasUppercase = computed(() => {
  return /[A-Z]/.test(form.value.password)
})

// ========================================
// METHODS
// ========================================
const validateField = (field) => {
  if (field === 'nama') {
    if (!form.value.nama.trim()) {
      errors.value.nama = 'Nama lengkap wajib diisi'
    } else if (form.value.nama.length < 3) {
      errors.value.nama = 'Nama minimal 3 karakter'
    } else {
      errors.value.nama = ''
    }
  }
  
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

const handleRegister = async () => {
  // Validate all fields
  validateField('nama')
  validateField('email')
  validateField('password')
  
  if (errors.value.nama || errors.value.email || errors.value.password) {
    return
  }

  if (!agreeTerms.value) {
    error.value = 'Harap setujui Syarat & Ketentuan'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = {
      nama: form.value.nama,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role,
      telepon: form.value.telepon || undefined
    }

    // Gunakan authApi untuk register
    await authApi.register(payload)
    success.value = '🎉 Registrasi berhasil! Silakan login.'
    
    // Redirect setelah delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (err) {
    const message = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.'
    if (message.toLowerCase().includes('email') || message.toLowerCase().includes('already')) {
      error.value = 'Email sudah terdaftar. Silakan gunakan email lain.'
    } else {
      error.value = message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ========================================
   LAYOUT
   ======================================== */
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1B6CA8 0%, #00b4d8 100%);
  padding: 20px;
}

.register-container {
  display: flex;
  max-width: 1100px;
  width: 100%;
  min-height: 680px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* ========================================
   LEFT SIDE - BRANDING
   ======================================== */
.register-brand {
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
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand-logo {
  display: flex;
  align-items: center;
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
  gap: 12px;
  width: 100%;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.feature-icon {
  font-size: 20px;
}

.back-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-top: 24px;
  font-size: 14px;
  transition: all 0.2s;
}

.back-link:hover {
  color: white;
  text-decoration: underline;
}

/* ========================================
   RIGHT SIDE - REGISTER FORM
   ======================================== */
.register-form-wrapper {
  flex: 1.2;
  padding: 40px 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  min-width: 360px;
  max-height: 90vh;
  overflow-y: auto;
}

.register-card {
  width: 100%;
  max-width: 420px;
}

.register-header {
  margin-bottom: 24px;
}

.register-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.register-header p {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

/* ========================================
   FORM
   ======================================== */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a2e;
}

.form-group .required {
  color: #e74c3c;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
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
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.password-toggle:hover {
  opacity: 1;
}

.password-hint {
  display: flex;
  gap: 16px;
  font-size: 12px;
  margin-top: 4px;
}

.password-hint span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-valid {
  color: #2ecc71;
}

.hint-invalid {
  color: #6c757d;
}

/* ========================================
   ROLE SELECTOR
   ======================================== */
.role-selector {
  display: flex;
  gap: 12px;
}

.role-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.role-btn:hover {
  border-color: #1B6CA8;
  background: #f0f8ff;
}

.role-btn.active {
  border-color: #1B6CA8;
  background: #1B6CA8;
  color: white;
  box-shadow: 0 2px 8px rgba(27, 108, 168, 0.3);
}

/* ========================================
   TERMS
   ======================================== */
.terms {
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #6c757d;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: #1B6CA8;
}

.checkbox-label a {
  color: #1B6CA8;
  text-decoration: none;
  font-weight: 500;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

/* ========================================
   MESSAGES
   ======================================== */
.error-message,
.success-message {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

/* ========================================
   BUTTON
   ======================================== */
.btn-register {
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
  margin-top: 4px;
}

.btn-register:hover:not(:disabled) {
  background: #154f7a;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(27, 108, 168, 0.3);
}

.btn-register:disabled {
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
.register-footer {
  margin-top: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.register-footer p {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.login-link {
  color: #1B6CA8;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
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
  .register-container {
    flex-direction: column;
    min-height: auto;
    max-height: none;
  }

  .register-brand {
    padding: 28px 20px;
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

  .register-form-wrapper {
    padding: 24px 20px;
    min-width: auto;
    max-height: none;
    overflow-y: visible;
  }

  .register-header h2 {
    font-size: 22px;
  }

  .role-selector {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .register-brand {
    padding: 20px 16px;
  }

  .brand-title {
    font-size: 24px;
  }

  .brand-subtitle {
    font-size: 13px;
  }

  .register-form-wrapper {
    padding: 20px 16px;
  }

  .register-header h2 {
    font-size: 20px;
  }

  .password-hint {
    flex-direction: column;
    gap: 4px;
  }

  .checkbox-label {
    font-size: 12px;
  }
}
</style>