const express = require('express')
const { getFleetStats } = require('../controllers/statsController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getFleetStats)

module.exports = router
