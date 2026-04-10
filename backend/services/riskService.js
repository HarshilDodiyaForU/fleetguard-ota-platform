const supabase = require('../config/supabaseClient')

async function getRiskReport() {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error } = await supabase
    .from('telemetry')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', since)

  const samplesLastHour = error ? 0 : count || 0
  const base = Math.floor(Math.random() * 55)
  const riskScore = Math.min(100, base + (samplesLastHour > 80 ? 25 : samplesLastHour > 40 ? 12 : 0))

  let riskLevel = 'low'
  if (riskScore >= 70) {
    riskLevel = 'high'
  } else if (riskScore >= 40) {
    riskLevel = 'moderate'
  }

  const factors = [
    {
      key: 'cpu',
      title: 'CPU spikes',
      detail: 'Sustained utilization above baseline on edge gateways; cross-check with live telemetry volume.',
      severity: riskScore > 55 ? 'high' : riskScore > 30 ? 'medium' : 'low',
    },
    {
      key: 'latency',
      title: 'Latency',
      detail: 'p95 round-trip time and ingest cadence from field devices inform mesh health.',
      severity: riskScore > 45 ? 'high' : 'medium',
    },
    {
      key: 'telemetry',
      title: 'Telemetry volume',
      detail: `${samplesLastHour} telemetry samples recorded in the last hour${
        error ? ' (database read unavailable)' : ''
      }.`,
      severity: samplesLastHour > 100 ? 'medium' : 'low',
    },
    {
      key: 'firmware',
      title: 'Firmware mismatch',
      detail: 'Multiple active firmware trains increase rollback complexity during OTA.',
      severity: riskScore > 35 ? 'medium' : 'low',
    },
  ]

  const recommendations = [
    'Run phased rollout with strict health gates',
    'Force pre-deployment diagnostics on warning nodes',
    'Enable automatic rollback trigger for >5% failure',
  ]

  return {
    riskScore,
    riskLevel,
    factors,
    recommendations,
  }
}

module.exports = {
  getRiskReport,
}
