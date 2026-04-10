let toastHandler = null

export function registerToastHandler(fn) {
  toastHandler = typeof fn === 'function' ? fn : null
}

export function emitAppToast(payload) {
  toastHandler?.(payload)
}
