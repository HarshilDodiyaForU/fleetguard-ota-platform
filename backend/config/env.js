const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'supersecret',
  supabaseUrl: process.env.SUPABASE_URL || '',
  telemetryIngestKey: process.env.TELEMETRY_INGEST_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
}
