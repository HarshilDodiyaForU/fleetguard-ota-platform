import axios from 'axios'
import { emitAppToast } from '../lib/toastBus'
import { getApiBaseUrl } from '../config/api'
import { clearTokens, getToken } from '../utils/tokenStorage'

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    } else if (
      !error.config?.skipGlobalErrorToast &&
      error.response?.status >= 400 &&
      error.response?.status !== 401
    ) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Request failed'
      emitAppToast({
        title: 'Request failed',
        description: typeof message === 'string' ? message : 'Please try again.',
        type: 'error',
      })
    }
    return Promise.reject(error)
  },
)

export default client
