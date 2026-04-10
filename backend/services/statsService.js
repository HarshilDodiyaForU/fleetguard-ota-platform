const { getDevicesFromDB } = require('./deviceService')

function buildSeriesPoint(hourOffset, successRate) {
  const time = new Date(Date.now() - hourOffset * 60 * 60 * 1000)
  return {
    hour: time.toISOString(),
    successRate,
  }
}

async function getStats() {
  const devices = await getDevicesFromDB()
  const totalDevices = devices.length
  const healthy = devices.filter((device) => device.status === 'healthy').length
  const updating = devices.filter((device) => device.status === 'updating').length
  const warning = devices.filter((device) => device.status === 'warning').length
  const failed = devices.filter((device) => device.status === 'failed').length
  const successRate =
    totalDevices === 0
      ? 0
      : Number((((healthy + updating + warning) / totalDevices) * 100).toFixed(2))

  const timeSeries = Array.from({ length: 24 }, (_, index) => {
    const drift = Math.floor(Math.random() * 8) - 4
    const pointRate = Math.min(100, Math.max(72, successRate + drift))
    return buildSeriesPoint(23 - index, pointRate)
  })

  return {
    totalDevices,
    healthy,
    updating,
    failed,
    successRate,
    timeSeries,
  }
}

module.exports = {
  getStats,
}
