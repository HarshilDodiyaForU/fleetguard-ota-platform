const KEY = 'token'

export function getToken() {
  return localStorage.getItem(KEY) || sessionStorage.getItem(KEY)
}

export function setToken(token, remember) {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
  if (remember) {
    localStorage.setItem(KEY, token)
  } else {
    sessionStorage.setItem(KEY, token)
  }
}

export function clearTokens() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}
