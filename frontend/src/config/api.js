/**
 * Production: set VITE_API_BASE_URL to your API host (with or without `/api`).
 * Examples: `https://your-backend.onrender.com` or `https://your-backend.onrender.com/api`
 * Legacy alias: VITE_API_URL is still supported.
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  if (raw) {
    let u = String(raw).replace(/\/$/, '')
    if (!/\/api$/i.test(u)) {
      u = `${u}/api`
    }
    return u
  }
  return 'http://localhost:5000/api'
}

/**
 * Socket.IO origin (no /api). Optional explicit VITE_SOCKET_URL; otherwise derived from API base.
 */
export function getSocketUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL
  if (explicit) {
    return String(explicit).replace(/\/$/, '')
  }
  const base = getApiBaseUrl()
  const stripped = base.replace(/\/api\/?$/i, '')
  return stripped || 'http://localhost:5000'
}
