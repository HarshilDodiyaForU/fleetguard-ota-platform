const { ingestTelemetry } = require('../services/telemetryService')

async function ingest(req, res, next) {
  try {
    const device = await ingestTelemetry(req.body)
    res.status(200).json({
      success: true,
      data: {
        id: device.id,
        external_id: device.external_id,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  ingest,
}
