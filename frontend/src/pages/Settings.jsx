import { useState } from 'react'
import { Save, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const USERS = [
  { id: 'U-101', name: 'Harper Collins', role: 'Owner', team: 'Platform', status: 'Active' },
  { id: 'U-102', name: 'Noah Patel', role: 'Operator', team: 'OTA Ops', status: 'Active' },
  { id: 'U-103', name: 'Mia Zhang', role: 'Security', team: 'Risk', status: 'Pending' },
  { id: 'U-104', name: 'Liam Rivera', role: 'Viewer', team: 'Analytics', status: 'Suspended' },
]

export default function Settings() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(() => user?.email?.split('@')[0] || 'Operator')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [telemetryPii, setTelemetryPii] = useState(false)
  const [strictRollout, setStrictRollout] = useState(true)

  return (
    <div className="space-y-6">
      <section className="card-glass p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
            <User className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Profile</h3>
            <p className="text-sm text-slate-400">Signed-in operator (JWT subject)</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-300">Email</span>
            <input
              readOnly
              value={user?.email || '—'}
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-300"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">Profile fields are UI-only until a dedicated user API exists.</p>
      </section>

      <section className="card-glass p-5">
        <h3 className="text-lg font-semibold text-white">Change password</h3>
        <p className="mt-1 text-sm text-slate-400">UI placeholder — wire to backend when password reset is available.</p>
        <div className="mt-4 max-w-md space-y-3">
          <label className="block text-sm">
            <span className="text-slate-300">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
            />
          </label>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-500"
          >
            <Save className="h-4 w-4" />
            Save password (disabled)
          </button>
        </div>
      </section>

      <section className="card-glass p-5">
        <h3 className="text-lg font-semibold text-white">System configuration</h3>
        <p className="mt-1 text-sm text-slate-400">Operational toggles (frontend-only state).</p>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-slate-200">Strict rollout gates</span>
            <input
              type="checkbox"
              checked={strictRollout}
              onChange={(e) => setStrictRollout(e.target.checked)}
              className="rounded border-white/20 text-cyan-500"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-slate-200">Redact PII in telemetry previews</span>
            <input
              type="checkbox"
              checked={telemetryPii}
              onChange={(e) => setTelemetryPii(e.target.checked)}
              className="rounded border-white/20 text-cyan-500"
            />
          </label>
        </div>
      </section>

      <article className="card-glass overflow-hidden p-5">
        <h3 className="text-lg font-semibold text-white">User access management</h3>
        <p className="mt-1 text-sm text-slate-300">Audit and control command center permissions.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead>
              <tr className="text-left text-slate-300">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Team</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {USERS.map((u) => (
                <tr key={u.id} className="text-slate-200">
                  <td className="px-3 py-3">{u.id}</td>
                  <td className="px-3 py-3">{u.name}</td>
                  <td className="px-3 py-3">{u.role}</td>
                  <td className="px-3 py-3">{u.team}</td>
                  <td className="px-3 py-3">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}
