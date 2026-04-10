const express = require('express')
const { deployFirmware, listDeployments } = require('../controllers/deployController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/history', protect, listDeployments)
router.post('/', protect, deployFirmware)

module.exports = router
