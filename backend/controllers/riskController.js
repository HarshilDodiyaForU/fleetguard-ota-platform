const { getRiskReport } = require('../services/riskService')

async function getRisk(req, res, next) {
  try {
    const data = await getRiskReport()
    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getRisk,
}
