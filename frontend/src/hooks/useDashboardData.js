import { useCallback, useEffect, useState } from 'react'
import { fetchDevices, fetchStats } from '../api/fleetguardApi'

function toHourLabel(isoTime) {
  return new Date(isoTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function buildDistribution(devices) {
  const summary = devices.reduce((acc, device) => {
    acc[device.status] = (acc[device.status] || 0) + 1
    return acc
  }, {})
  return Object.entries(summary).map(([name, value]) => ({ name, value }))
}

function buildActivity(timeSeries = []) {
  return timeSeries.slice(-6).reverse().map((point, index) => ({
    id: `${point.hour}-${index}`,
    message: `Success rate at ${toHourLabel(point.hour)} stabilized at ${point.successRate}%`,
    time: toHourLabel(point.hour),
  }))
}

function mapStatsToDashboard(stats, devices) {
  return {
    kpis: {
      totalDevices: stats.totalDevices,
      healthScore: stats.successRate,
      activeRollouts: stats.updating,
      failedToday: stats.failed,
    },
    successTrend: stats.timeSeries.slice(-7).map((point) => ({
      day: toHourLabel(point.hour),
      rate: point.successRate,
    })),
    distribution: buildDistribution(devices),
    activityFeed: buildActivity(stats.timeSeries),
  }
}

export function useDashboardData({ enabled = true, notifyError } = {}) {
  const [state, setState] = useState({
    isLoading: true,
    kpis: { totalDevices: 0, healthScore: 0, activeRollouts: 0, failedToday: 0 },
    successTrend: [],
    distribution: [],
    activityFeed: [],
  })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true }))
    try {
      const [stats, devices] = await Promise.all([fetchStats(), fetchDevices()])
      const mapped = mapStatsToDashboard(stats, devices)
      setState((current) => ({ ...current, ...mapped, isLoading: false }))
    } catch (error) {
      setState((current) => ({ ...current, isLoading: false }))
      notifyError?.({
        title: 'Dashboard sync failed',
        description: error?.response?.data?.message || 'Unable to load dashboard stats.',
      })
    }
  }, [notifyError])

  useEffect(() => {
    if (!enabled) return undefined
    const initialTimer = window.setTimeout(() => {
      load()
    }, 0)

    const timer = window.setInterval(load, 15000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [enabled, load])

  return state
}
