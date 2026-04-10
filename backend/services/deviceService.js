const supabase = require('../config/supabaseClient')

const DEVICE_STATUSES = ['healthy', 'updating', 'failed', 'warning']
const FIRMWARE_VERSIONS = ['v5.6.1', 'v5.6.0', 'v5.5.9', 'v5.5.8']
const REGIONS = ['US-East', 'EU-West', 'APAC', 'Unassigned']
const DEVICE_NAMES = [
  'Gateway Alpha',
  'Gateway Bravo',
  'Gateway Charlie',
  'Gateway Delta',
  'Edge Node Echo',
  'Edge Node Foxtrot',
]

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(items) {
  return items[randomInteger(0, items.length - 1)]
}

function mapDeviceRow(row) {
  if (!row) return row
  return {
    id: row.id,
    external_id: row.external_id ?? null,
    name: row.name,
    status: row.status,
    region: row.region ?? 'Unassigned',
    cpu: row.cpu ?? null,
    memory: row.memory ?? null,
    latency: row.latency ?? null,
    firmware: row.firmware_version ?? row.firmware ?? null,
    last_seen: row.last_seen,
    created_at: row.created_at,
  }
}

function generateDevice(index) {
  const status = randomItem(DEVICE_STATUSES)
  const now = new Date().toISOString()

  return {
    external_id: null,
    name: `${randomItem(DEVICE_NAMES)}-${String(index + 1).padStart(2, '0')}`,
    status,
    region: randomItem(REGIONS),
    cpu: Number((randomInteger(18, status === 'failed' ? 100 : 92) + Math.random()).toFixed(2)),
    latency: Number(
      (randomInteger(status === 'failed' ? 180 : 15, status === 'failed' ? 400 : 160) + Math.random()).toFixed(2),
    ),
    firmware_version: randomItem(FIRMWARE_VERSIONS),
    last_seen: now,
  }
}

function generateDevices(count = 50) {
  return Array.from({ length: count }, (_, index) => generateDevice(index))
}

async function seedDevicesIfEmpty(count = 50) {
  const { count: existingCount, error: countError } = await supabase
    .from('devices')
    .select('*', { count: 'exact', head: true })

  if (countError) throw countError
  if (existingCount && existingCount > 0) return

  const seedPayload = generateDevices(count)
  const { error } = await supabase.from('devices').insert(seedPayload)
  if (error) throw error
}

async function getDevicesFromDB() {
  const { data, error } = await supabase.from('devices').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapDeviceRow)
}

async function emitDeviceTelemetryUpdate() {
  const devices = await getDevicesFromDB()
  if (global.io) {
    global.io.emit('devices:update', devices)
  }
  return devices
}

async function jitterDeviceTelemetry() {
  const { data: rawRows, error } = await supabase.from('devices').select('*').order('created_at', { ascending: false })
  if (error || !rawRows?.length) return

  const picks = [...rawRows].sort(() => Math.random() - 0.5).slice(0, Math.min(20, rawRows.length))
  const now = new Date().toISOString()

  for (const d of picks) {
    const status = d.status
    const cpu = Math.max(
      5,
      Math.min(99, Number(d.cpu || 0) + randomInteger(-6, 6) + Math.random()),
    )
    const latency = Math.max(
      10,
      Math.min(
        450,
        Number(d.latency || 0) + randomInteger(status === 'failed' ? -20 : -25, status === 'failed' ? 40 : 25),
      ),
    )

    // eslint-disable-next-line no-await-in-loop
    const { error: updateError } = await supabase
      .from('devices')
      .update({
        cpu: Number(cpu.toFixed(2)),
        latency: Number(latency.toFixed(2)),
        last_seen: now,
      })
      .eq('id', d.id)

    if (updateError) break
  }
}

module.exports = {
  generateDevices,
  seedDevicesIfEmpty,
  getDevicesFromDB,
  mapDeviceRow,
  emitDeviceTelemetryUpdate,
  jitterDeviceTelemetry,
}
