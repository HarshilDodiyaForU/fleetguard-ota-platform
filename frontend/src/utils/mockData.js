const STATUSES = ['healthy', 'warning', 'offline']
const REGIONS = ['US-East', 'US-West', 'EU-Central', 'APAC']

export function createMockDevices() {
  return Array.from({ length: 18 }, (_, index) => {
    const status = STATUSES[index % STATUSES.length]
    return {
      id: `FG-${1000 + index}`,
      name: `Vehicle Gateway ${index + 1}`,
      region: REGIONS[index % REGIONS.length],
      status,
      cpu: randomBetween(18, 92),
      ram: randomBetween(22, 88),
      latency: randomBetween(20, 180),
      firmware: index % 2 === 0 ? 'v5.6.1' : 'v5.5.8',
    }
  })
}

export const baseSuccessTrend = [
  { day: 'Mon', rate: 93 },
  { day: 'Tue', rate: 91 },
  { day: 'Wed', rate: 95 },
  { day: 'Thu', rate: 96 },
  { day: 'Fri', rate: 94 },
  { day: 'Sat', rate: 97 },
  { day: 'Sun', rate: 96 },
]

export const activityTemplates = [
  'Canary deployment initiated for v5.6.1',
  'Health check passed on edge-cluster-07',
  'Rollback snapshot captured for EU fleet',
  'Offline node reconnected in APAC',
  'Telemetry anomaly auto-resolved by policy',
]

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
