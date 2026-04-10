/**
 * POST /api/telemetry — optional shared secret.
 * Production: TELEMETRY_INGEST_KEY must be set; requests must send X-FleetGuard-Telemetry-Key.
 * Development: if TELEMETRY_INGEST_KEY is unset, ingest is open (local ESP32 testing).
 */
function telemetryIngestAuth(req, res, next) {
  const key = process.env.TELEMETRY_INGEST_KEY
  if (process.env.NODE_ENV === 'production') {
    if (!key) {
      return res.status(503).json({
        success: false,
        message: 'Telemetry ingest is not configured (set TELEMETRY_INGEST_KEY).',
      })
    }
    const provided = req.get('x-fleetguard-telemetry-key')
    if (!provided || provided !== key) {
      return res.status(401).json({ success: false, message: 'Invalid or missing telemetry key.' })
    }
    return next()
  }
  if (key) {
    const provided = req.get('x-fleetguard-telemetry-key')
    if (provided && provided !== key) {
      return res.status(401).json({ success: false, message: 'Invalid telemetry key.' })
    }
  }
  return next()
}

module.exports = { telemetryIngestAuth }
