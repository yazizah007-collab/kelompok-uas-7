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
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="login-form-wrapper">
        <div class="login-card">
          <div class="login-header">
            <h2>Lupa Password</h2>
            <p>Masukkan email dan password baru kamu</p>
          </div>

          <div v-if="success" class="success-message">
            <span>✅</span>
            {{ success }}
          </div>

          <form v-else @submit.prevent="handleReset" class="login-form">
            <div class="form-group">
              <label>📧 Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="Masukkan email akun kamu"
                required
                :class="{ 'input-error': errors.email }"
                @blur="validateField('email')"
              />
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label>🔒 Password Baru</label>
              <div class="password-wrapper">
                <input
                  v-model="form.newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Minimal 6 karakter"
                  required
                  :class="{ 'input-error': errors.newPassword }"
                  @blur="validateField('newPassword')"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</span>
            </div>

            <div class="form-group">
              <label>🔒 Konfirmasi Password Baru</label>
              <input
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ulangi password baru"
                required
                :class="{ 'input-error': errors.confirmPassword }"
                @blur="validateField('confirmPassword')"
              />
              <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
            </div>

            <div v-if="error" class="error-message">
              <span>❌</span>
              {{ error }}
            </div>

            <button type="submit" class="btn btn-primary btn-login" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Memproses...' : '🔑 Reset Password' }}
            </button>
          </form>

          <div class="login-footer">
            <router-link to="/login" class="register-link">← Kembali ke Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authApi } from '../../api'

const form = ref({
  email: '',
  newPassword: '',
  confirmPassword: ''
})
const errors = ref({
  email: '',
  newPassword: '',
  confirmPassword: ''
})
const error = ref('')
const success = ref('')
const loading = ref(false)
const showPassword = ref(false)

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

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

  if (field === 'newPassword') {
    if (!form.value.newPassword) {
      errors.value.newPassword = 'Password baru wajib diisi'
    } else if (form.value.newPassword.length < 6) {
      errors.value.newPassword = 'Password minimal 6 karakter'
    } else {
      errors.value.newPassword = ''
    }
  }

  if (field === 'confirmPassword') {
    if (form.value.confirmPassword !== form.value.newPassword) {
      errors.value.confirmPassword = 'Konfirmasi password tidak cocok'
    } else {
      errors.value.confirmPassword = ''
    }
  }
}

const handleReset = async () => {
  validateField('email')
  validateField('newPassword')
  validateField('confirmPassword')

  if (errors.value.email || errors.value.newPassword || errors.value.confirmPassword) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authApi.resetPassword({
      email: form.value.email,
      newPassword: form.value.newPassword
    })
    success.value = 'Password berhasil diubah! Silakan login dengan password barumu.'
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal reset password. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
  min-height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
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
.brand-content { text-align: center; max-width: 320px; }
.brand-logo { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 12px; }
.logo-image { width: 56px; height: 56px; object-fit: contain; filter: brightness(0) invert(1); }
.brand-title { font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 1px; }
.brand-subtitle { font-size: 16px; opacity: 0.9; font-weight: 300; }

.login-form-wrapper {
  flex: 1;
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  min-width: 320px;
}
.login-card { width: 100%; max-width: 380px; }
.login-header { margin-bottom: 32px; }
.login-header h2 { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px 0; }
.login-header p { color: #6c757d; font-size: 15px; margin: 0; }

.login-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-weight: 600; font-size: 14px; color: #1a1a2e; }
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
.form-group .input-error { border-color: #e74c3c; }
.error-text { color: #e74c3c; font-size: 12px; }

.password-wrapper { position: relative; }
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
}
.password-toggle:hover { opacity: 1; }

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
.success-message {
  background: #d4edda;
  color: #155724;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #c3e6cb;
}

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
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

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

.login-footer { margin-top: 24px; text-align: center; }
.register-link {
  color: #1B6CA8;
  font-weight: 600;
  text-decoration: none;
}
.register-link:hover { color: #154f7a; text-decoration: underline; }

@media (max-width: 768px) {
  .login-container { flex-direction: column; min-height: auto; }
  .login-brand { padding: 32px 24px; min-width: auto; }
  .login-form-wrapper { padding: 32px 24px; min-width: auto; }
}
</style>