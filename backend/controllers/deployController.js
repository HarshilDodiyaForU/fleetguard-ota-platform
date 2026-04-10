const {
  createDeploymentRecord,
  listRecentDeployments,
  simulateDeploymentProgress,
  withStrategyPayload,
} = require('../services/deployService')

async function listDeployments(req, res, next) {
  try {
    const rows = await listRecentDeployments(25)
    res.status(200).json({ success: true, data: rows })
  } catch (error) {
    next(error)
  }
}

async function deployFirmware(req, res, next) {
  try {
    const strategy = (req.body.strategy || '').toLowerCase()
    const version = req.body.version || req.body.firmwareVersion || null
    const deployment = await createDeploymentRecord(strategy, version)

    if (global.io) {
      global.io.emit('deploy:update', withStrategyPayload(deployment))
    }

    simulateDeploymentProgress(deployment.id)

    res.status(201).json({
      success: true,
      data: {
        deploymentId: deployment.id,
        status: deployment.status,
        progress: deployment.progress,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  deployFirmware,
  listDeployments,
}
