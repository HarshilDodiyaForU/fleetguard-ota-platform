import { useCallback, useEffect, useState } from 'react'
import { fetchRisk } from '../api/fleetguardApi'

export function useRiskReport({ enabled = true, notifyError } = {}) {
  const [risk, setRisk] = useState({
    riskScore: 0,
    riskLevel: 'low',
    factors: [],
    recommendations: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await fetchRisk()
      setRisk(data)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      setLoadError(error?.response?.data?.message || 'Unable to load risk analytics.')
      notifyError?.({
        title: 'Risk sync failed',
        description: error?.response?.data?.message || 'Unable to load risk analytics.',
      })
    }
  }, [notifyError])

  useEffect(() => {
    if (!enabled) return undefined
    const initialTimer = window.setTimeout(() => {
      load()
    }, 0)
    const timer = window.setInterval(load, 20000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [enabled, load])

  return { risk, isLoading, loadError }
}
