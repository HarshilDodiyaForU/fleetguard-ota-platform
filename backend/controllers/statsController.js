const { getStats } = require('../services/statsService')

async function getFleetStats(req, res, next) {
  try {
    const stats = await getStats()

    res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getFleetStats,
}
