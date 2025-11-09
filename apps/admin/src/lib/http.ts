import axios from 'axios'
import { env } from '@/lib/env'

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  // Add auth header if stored (placeholder for future integration)
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

