import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - attach JWT token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = Cookies.get('refresh_token')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh })
        Cookies.set('access_token', data.access, { expires: 1 })
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  googleLogin: (credential: string) => api.post('/auth/google-login', { credential }),
  logout: (refresh: string) => api.post('/auth/logout', { refresh }),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
  getAddresses: () => api.get('/auth/addresses'),
  createAddress: (data: any) => api.post('/auth/addresses', data),
  updateAddress: (id: number, data: any) => api.patch(`/auth/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete(`/auth/addresses/${id}`),
}

// Catalog APIs
export const catalogApi = {
  getCategories: () => api.get('/categories'),
  getBrands: () => api.get('/brands'),
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (slug: string) => api.get(`/products/${slug}`),
  getBanners: (position?: string) => api.get('/banners', { params: position ? { position } : {} }),
}

// Order APIs
export const orderApi = {
  preview: (data: any) => api.post('/orders/preview', data),
  create: (data: any) => api.post('/orders/create', data),
  getMyOrders: () => api.get('/orders/me'),
  getOrder: (id: number) => api.get(`/orders/${id}`),
}

// Payment APIs
export const paymentApi = {
  init: (data: any) => api.post('/payments/init', data),
}


