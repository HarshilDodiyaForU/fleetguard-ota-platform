import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import ToastContainer from '../components/ui/ToastContainer'
import { registerToastHandler } from '../lib/toastBus'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    ({ title, description, type = 'error', duration = 5000 }) => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((current) => [...current, { id, title, description, type }])
      window.setTimeout(() => dismissToast(id), duration)
    },
    [dismissToast],
  )

  useEffect(() => {
    registerToastHandler(pushToast)
    return () => registerToastHandler(null)
  }, [pushToast])

  const value = useMemo(() => ({ pushToast, dismissToast }), [pushToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return ctx
}
