/**
 * CORS / Socket.IO origin configuration.
 * Set FRONTEND_URL in production (e.g. https://your-app.vercel.app).
 * Comma-separated for multiple origins (preview + production).
 */
function getCorsOrigin() {
  const raw = process.env.FRONTEND_URL
  if (!raw) return '*'
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) return '*'
  return list.length === 1 ? list[0] : list
}

module.exports = {
  getCorsOrigin,
}
