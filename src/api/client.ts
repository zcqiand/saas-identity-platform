import axios, { type AxiosInstance, type AxiosError } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

// 当前 token（由 authStore 在 login/logout 时通过 setToken 同步）
let currentToken: string | null = null
// 401 回调（由 App 注册，通常跳 SSO）
let unauthorizedHandler: (() => void) | null = null

export function setToken(token: string | null) {
  currentToken = token
}

export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler
}

export function resetApiClient() {
  currentToken = null
  unauthorizedHandler = null
}

export const apiClient: AxiosInstance = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      currentToken = null
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)
