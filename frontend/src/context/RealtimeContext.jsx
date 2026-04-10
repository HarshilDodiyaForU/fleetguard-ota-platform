import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import socket from '../socket'
import { useAuth } from './AuthContext'

const RealtimeContext = createContext(null)

export function RealtimeProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [liveDevices, setLiveDevices] = useState(null)
  const [liveDeployment, setLiveDeployment] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  useEffect(() => {
    if (!isAuthenticated) {
      const handle = window.setTimeout(() => {
        setLiveDevices(null)
        setLiveDeployment(null)
      }, 0)
      return () => window.clearTimeout(handle)
    }

    const onConnect = () => setConnectionStatus('connected')
    const onDisconnect = () => setConnectionStatus('disconnected')
    const onReconnectAttempt = () => setConnectionStatus('reconnecting')

    const onDevices = (data) => {
      setLiveDevices(Array.isArray(data) ? data : [])
    }
    const onDeploy = (data) => {
      setLiveDeployment(data)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.io.on('reconnect_attempt', onReconnectAttempt)
    socket.io.on('reconnect', onConnect)
    socket.on('devices:update', onDevices)
    socket.on('deploy:update', onDeploy)

    if (socket.connected) {
      onConnect()
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.io.off('reconnect_attempt', onReconnectAttempt)
      socket.io.off('reconnect', onConnect)
      socket.off('devices:update', onDevices)
      socket.off('deploy:update', onDeploy)
    }
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      liveDevices,
      liveDeployment,
      setLiveDeployment,
      connectionStatus,
    }),
    [liveDevices, liveDeployment, connectionStatus],
  )

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext)
  if (!ctx) {
    throw new Error('useRealtime must be used within RealtimeProvider')
  }
  return ctx
}
