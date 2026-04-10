const { generateDevices } = require('../services/deviceService')

const memoryStore = {
  devices: generateDevices(50),
  deployments: [],
}

module.exports = memoryStore
