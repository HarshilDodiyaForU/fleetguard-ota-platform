import { Loader2, Radio } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchDeploymentHistory } from '../api/fleetguardApi'

const STRATEGIES = ['Canary', 'Rolling', 'Immediate']

export default function Rollout({
  activeDevices,
  onDeploy,
  isSubmitting,
  liveDeployment,
  connectionStatus,
}) {
  const [form, setForm] = useState({
    strategy: 'Canary',
    firmwareVersion: 'v5.6.1',
    targetGroup: 'North America Edge',
  })
  const [deploying, setDeploying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [trackingId, setTrackingId] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    try {
      const rows = await fetchDeploymentHistory()
      setHistory(Array.isArray(rows) ? rows : [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (!liveDeployment || !trackingId) return
    if (liveDeployment.id !== trackingId) return
    setProgress(liveDeployment.progress ?? 0)
    if (liveDeployment.status === 'completed') {
      setDeploying(false)
      loadHistory()
    } else {
      setDeploying(true)
    }
  }, [liveDeployment, trackingId, loadHistory])

  const progressLabel = useMemo(() => {
    if (progress === 0 && !deploying) return 'Awaiting deployment start'
    if (progress < 40) return 'Bootstrapping canary wave'
    if (progress < 75) return 'Rolling updates across target fleet'
    if (progress < 100) return 'Performing post-deploy checks'
    return 'Deployment completed successfully'
  }, [progress, deploying])

  const affectedDevices = useMemo(() => {
    if (!activeDevices || !progress) return 0
    return Math.min(activeDevices, Math.max(1, Math.round((activeDevices * progress) / 100)))
  }, [activeDevices, progress])

  const startDeployment = async () => {
    const result = await onDeploy({ strategy: form.strategy, firmwareVersion: form.firmwareVersion })
    if (!result?.deploymentId) return
    setTrackingId(result.deploymentId)
    setDeploying(true)
    setProgress(Math.max(0, result.progress ?? 0))
    loadHistory()
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-2">
        <article className="card-glass p-5">
          <h3 className="text-lg font-semibold text-white">Deployment Strategy</h3>
          <p className="mt-1 text-sm text-slate-300">Trigger OTA updates with controlled blast radius.</p>

          <div className="mt-5 space-y-4">
            <label className="block text-sm">
              <span className="text-slate-300">Strategy</span>
              <select
                value={form.strategy}
                onChange={(event) => setForm((prev) => ({ ...prev, strategy: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0F173D] px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
              >
                {STRATEGIES.map((strategy) => (
                  <option key={strategy} value={strategy}>
                    {strategy}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Firmware Version</span>
              <input
                value={form.firmwareVersion}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firmwareVersion: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Target Group</span>
              <input
                value={form.targetGroup}
                onChange={(event) => setForm((prev) => ({ ...prev, targetGroup: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={startDeployment}
            disabled={deploying || isSubmitting}
            className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-700"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </span>
            ) : deploying ? (
              'Deployment Running...'
            ) : (
              'Start Deployment'
            )}
          </button>
        </article>

        <article className="card-glass p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">Rollout Progress</h3>
            {connectionStatus ? (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Radio className="h-3 w-3 text-cyan-400" />
                {connectionStatus}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-300">
            {activeDevices} devices in scope · ~{affectedDevices} reached at current progress
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">{progressLabel}</span>
              <span className="font-semibold text-cyan-300">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </article>
      </div>

      <article className="card-glass overflow-hidden p-5">
        <h3 className="text-lg font-semibold text-white">Deployment History</h3>
        <p className="mt-1 text-sm text-slate-400">Recent OTA jobs from the fleet pipeline.</p>
        <div className="mt-4 overflow-x-auto">
          {historyLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-white/5" />
          ) : (
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead>
                <tr className="text-left text-slate-300">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Version</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Progress</th>
                  <th className="px-3 py-2 font-medium">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                      No deployments yet. Start a rollout to see history here.
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id} className="text-slate-200">
                      <td className="px-3 py-2 font-mono text-xs">{row.id?.slice(0, 8)}…</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.version || '—'}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.progress ?? 0}%</td>
                      <td className="px-3 py-2 text-xs text-slate-400">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </article>
    </div>
  )
}
