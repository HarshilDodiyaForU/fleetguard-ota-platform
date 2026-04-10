import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeJwtPayload, isJwtExpired } from '../utils/jwtDecode'
import { clearTokens, getToken, setToken as persistToken } from '../utils/tokenStorage'

const AuthContext = createContext(null)

function readToken() {
  return getToken()
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setTokenState] = useState(readToken)

  const logout = useCallback(
    (reason) => {
      clearTokens()
      setTokenState(null)
      navigate('/login', {
        replace: true,
        state: typeof reason === 'string' ? { reason } : undefined,
      })
    },
    [navigate],
  )

  const login = useCallback((newToken, remember) => {
    persistToken(newToken, remember)
    setTokenState(newToken)
  }, [])

  useEffect(() => {
    if (!token) return undefined
    if (isJwtExpired(token)) {
      const handle = window.setTimeout(() => logout('session_expired'), 0)
      return () => window.clearTimeout(handle)
    }
    const id = window.setInterval(() => {
      const current = getToken()
      if (!current) return
      if (isJwtExpired(current)) {
        logout('session_expired')
      }
    }, 30000)
    return () => window.clearInterval(id)
  }, [token, logout])

  const user = useMemo(() => {
    const payload = decodeJwtPayload(token)
    if (!payload) return null
    return {
      id: payload.id,
      email: payload.email || null,
    }
  }, [token])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
