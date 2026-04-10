const supabase = require('../config/supabaseClient')
const { emitDeviceTelemetryUpdate } = require('./deviceService')

function badRequest(message) {
  const err = new Error(message)
  err.statusCode = 400
  return err
}

function parseOptionalMetric(value, label) {
  if (value === undefined || value === null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) throw badRequest(`${label} must be a finite number when provided`)
  return n
}

/**
 * Ingest telemetry from ESP32 / gateways. device_id is the external_id string (not UUID).
 * cpu / latency may be omitted (stored as null).
 */
async function ingestTelemetry(body) {
  const externalId = String(body?.device_id ?? '').trim()
  if (!externalId) throw badRequest('device_id is required')

  const cpu = parseOptionalMetric(body.cpu, 'cpu')
  const latency = parseOptionalMetric(body.latency, 'latency')

  const now = new Date().toISOString()

  const { data: existing, error: findError } = await supabase
    .from('devices')
    .select('*')
    .eq('external_id', externalId)
    .maybeSingle()

  if (findError) throw findError

  let deviceRow = existing

  const devicePatch = { last_seen: now }
  if (cpu !== null) devicePatch.cpu = cpu
  if (latency !== null) devicePatch.latency = latency

  if (!deviceRow) {
    const insert = {
      external_id: externalId,
      name: `Device ${externalId}`,
      status: 'healthy',
      region: 'Edge',
      cpu: cpu ?? null,
      latency: latency ?? null,
      firmware_version: 'v0.0.0',
      last_seen: now,
    }
    const { data: created, error: insertError } = await supabase
      .from('devices')
      .insert([insert])
      .select('*')
      .single()

    if (insertError) throw insertError
    deviceRow = created
  } else {
    const { error: updateError } = await supabase.from('devices').update(devicePatch).eq('id', deviceRow.id)

    if (updateError) throw updateError
  }

  const { error: telemetryError } = await supabase.from('telemetry').insert([
    {
      device_id: deviceRow.id,
      cpu,
      latency,
      timestamp: now,
    },
  ])

  if (telemetryError) throw telemetryError

  await emitDeviceTelemetryUpdate()
  return deviceRow
}

module.exports = {
  ingestTelemetry,
}
