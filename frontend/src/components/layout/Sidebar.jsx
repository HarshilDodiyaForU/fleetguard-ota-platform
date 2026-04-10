import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import {
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Rocket,
  Settings,
  Truck,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fleet', path: '/fleet', label: 'Fleet', icon: Truck },
  { id: 'rollout', path: '/rollout', label: 'Rollout', icon: Rocket },
  { id: 'risk', path: '/risk', label: 'Risk', icon: AlertTriangle },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#0B1334]/80 p-5 backdrop-blur-xl lg:flex">
      <div className="mb-8 rounded-xl border border-cyan-400/20 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
          FleetGuard
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">OTA Command Center</h1>
      </div>

      <nav className="flex flex-1 flex-col space-y-2">
        {NAV_ITEMS.map(({ id, path, label, icon }) => (
          <NavLink
            key={id}
            to={path}
            className={({ isActive }) =>
              `group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-300 ${
                isActive
                  ? 'border-cyan-400/40 bg-cyan-400/20 text-cyan-100 shadow-lg shadow-cyan-950/50'
                  : 'border-transparent bg-white/5 text-slate-300 hover:border-white/15 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {createElement(icon, { className: 'h-4 w-4' })}
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {onLogout ? (
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      ) : null}
    </aside>
  )
}
