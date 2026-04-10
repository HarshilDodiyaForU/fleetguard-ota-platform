const { getDevicesFromDB } = require('../services/deviceService')

async function getDevices(req, res, next) {
  try {
    const devices = await getDevicesFromDB()
    res.status(200).json({
      success: true,
      data: devices,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDevices,
}
