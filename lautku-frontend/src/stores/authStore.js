import { defineStore } from 'pinia'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || null
  },

  actions: {
    async login(credentials) {
      const res = await authApi.login(credentials)
      const { token, user } = res.data

      this.token = token
      this.user = user

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      return user
    },

    async register(data) {
      const res = await authApi.register(data)
      return res.data
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async fetchMe() {
      const res = await authApi.getMe()
      this.user = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
      return res.data
    }
  }
})