import { Bell, LogOut, Menu, Radio } from 'lucide-react'
import { formatNow } from '../../utils/formatters'

const connectionStyles = {
  connected: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  disconnected: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  reconnecting: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
}

export default function Header({ title, onLogout, connectionStatus }) {
  return (
    <header className="card-glass flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-300">{formatNow()}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {connectionStatus ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${connectionStyles[connectionStatus] || connectionStyles.disconnected}`}
          >
            <Radio className="h-3 w-3" />
            Live {connectionStatus}
          </span>
        ) : null}
        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        ) : null}
      </div>
    </header>
  )
}
