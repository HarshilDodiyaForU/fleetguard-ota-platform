const REGIONS = ['US-East', 'US-West', 'EU-Central', 'APAC']

export function decorateDevice(device, index) {
  return {
    ...device,
    name: device.name || `Vehicle Gateway ${index + 1}`,
    region: device.region || REGIONS[index % REGIONS.length],
    ram: device.ram ?? device.memory,
  }
}

export function decorateDeviceList(list) {
  if (!Array.isArray(list)) return []
  return list.map((d, i) => decorateDevice(d, i))
}
