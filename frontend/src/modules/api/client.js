import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15000,
})

// Token storage
function getToken() {
  return localStorage.getItem('access_token')
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Auto logout on 401
    if (error?.response?.status === 401) {
      localStorage.removeItem('access_token')
      if (!location.pathname.startsWith('/login')) {
        location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)
