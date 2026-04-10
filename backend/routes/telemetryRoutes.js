const express = require('express')
const rateLimit = require('express-rate-limit')
const { telemetryIngestAuth } = require('../middleware/telemetryIngestAuth')
const { ingest } = require('../controllers/telemetryController')

const router = express.Router()

const telemetryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/', telemetryLimiter, telemetryIngestAuth, ingest)

module.exports = router
