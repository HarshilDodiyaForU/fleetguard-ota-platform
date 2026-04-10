import { useCallback, useEffect, useState } from 'react'
import { fetchDevices } from '../api/fleetguardApi'
import { decorateDeviceList } from '../utils/deviceDisplay'

export function useFleetDevices({ enabled = true, notifyError } = {}) {
  const [devices, setDevices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchDevices()
      setDevices(decorateDeviceList(result))
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      notifyError?.({
        title: 'Fleet sync failed',
        description: error?.response?.data?.message || 'Unable to load device list.',
      })
    }
  }, [notifyError])

  useEffect(() => {
    if (!enabled) return undefined
    const initialTimer = window.setTimeout(() => {
      load()
    }, 0)
    const timer = window.setInterval(load, 10000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [enabled, load])

  return { devices, isLoading }
}
