export function formatNow() {
  return new Date().toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function statusClassName(status) {
  if (status === 'healthy') return 'bg-emerald-500/20 text-emerald-200'
  if (status === 'updating') return 'bg-cyan-500/20 text-cyan-200'
  if (status === 'warning') return 'bg-amber-500/20 text-amber-200'
  return 'bg-rose-500/20 text-rose-200'
}
