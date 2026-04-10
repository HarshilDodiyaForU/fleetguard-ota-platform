const express = require('express')
const http = require('http')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { Server } = require('socket.io')
const { port: configPort } = require('./config/env')
const { getCorsOrigin } = require('./config/corsConfig')
const { errorHandler, notFoundHandler } = require('./config/errorHandler')
const {
  seedDevicesIfEmpty,
  emitDeviceTelemetryUpdate,
  jitterDeviceTelemetry,
} = require('./services/deviceService')
const authRoutes = require('./routes/authRoutes')
const deviceRoutes = require('./routes/deviceRoutes')
const deployRoutes = require('./routes/deployRoutes')
const statsRoutes = require('./routes/statsRoutes')
const riskRoutes = require('./routes/riskRoutes')
const telemetryRoutes = require('./routes/telemetryRoutes')

const app = express()
const server = http.createServer(app)

const corsOrigin = getCorsOrigin()

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
})

global.io = io
io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  console.log('Client connected:', socket.id)
})

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
)
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'combined'))
app.use(express.json())
app.use('/api/telemetry', telemetryRoutes)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

app.get('/', (req, res) => {
  res.type('text/plain').send('FleetGuard Backend Running 🚀')
})

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FleetGuard backend is healthy',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/deploy', deployRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/risk', riskRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error('FATAL: JWT_SECRET is required in production')
    process.exit(1)
  }

  try {
    await seedDevicesIfEmpty(50)
    await emitDeviceTelemetryUpdate()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Bootstrap warning:', error.message)
  }

  const listenPort = Number(process.env.PORT) || configPort || 5000
  server.listen(listenPort, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${process.env.PORT || listenPort}`)
  })

  const telemetryMs = Number(process.env.TELEMETRY_EMIT_MS) || 15000
  setInterval(async () => {
    try {
      await jitterDeviceTelemetry()
      await emitDeviceTelemetryUpdate()
    } catch {
      /* quiet — Supabase may be offline in dev */
    }
  }, telemetryMs)
}

bootstrap()
