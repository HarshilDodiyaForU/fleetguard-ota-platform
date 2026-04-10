const express = require('express')
const { getRisk } = require('../controllers/riskController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getRisk)

module.exports = router
