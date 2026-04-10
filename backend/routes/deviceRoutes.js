const express = require('express')
const { getDevices } = require('../controllers/deviceController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getDevices)

module.exports = router
