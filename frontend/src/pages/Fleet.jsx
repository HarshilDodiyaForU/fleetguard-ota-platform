import { useMemo, useState } from 'react'
import { ArrowDownAZ, Grid3x3, List, Radio } from 'lucide-react'
import DeviceCard from '../components/ui/DeviceCard'

const FILTER_OPTIONS = ['all', 'healthy', 'updating', 'failed', 'warning']

function sortDevices(list, sortBy) {
  const next = [...list]
  if (sortBy === 'cpu') {
    next.sort((a, b) => (Number(b.cpu) || 0) - (Number(a.cpu) || 0))
  } else if (sortBy === 'latency') {
    next.sort((a, b) => (Number(b.latency) || 0) - (Number(a.latency) || 0))
  } else {
    next.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }
  return next
}

export default function Fleet({ devices, isLoading }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [view, setView] = useState('grid')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return devices.filter((device) => {
      const idMatch = String(device.id || '').toLowerCase().includes(q)
      const nameMatch = (device.name || '').toLowerCase().includes(q)
      const matchQuery = q === '' || idMatch || nameMatch
      const matchStatus = status === 'all' ? true : device.status === status
      return matchQuery && matchStatus
    })
  }, [devices, query, status])

  const sorted = useMemo(() => sortDevices(filtered, sortBy), [filtered, sortBy])

  return (
    <div className="space-y-5">
      <div className="card-glass flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by device ID or name..."
          className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#0F173D] px-3 py-2 text-sm text-slate-100 focus:border-cyan-300 focus:outline-none"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'all' ? 'All statuses' : option}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <ArrowDownAZ className="h-4 w-4 text-slate-400" aria-hidden />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#0F173D] px-3 py-2 text-sm text-slate-100 focus:border-cyan-300 focus:outline-none"
          >
            <option value="name">Sort: Name</option>
            <option value="cpu">Sort: CPU (high → low)</option>
            <option value="latency">Sort: Latency (high → low)</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`rounded-md p-2 ${view === 'grid' ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400'}`}
            aria-label="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-md p-2 ${view === 'list' ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400'}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`device-skeleton-${index}`}
              className="card-glass h-44 animate-pulse border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card-glass flex flex-col items-center justify-center gap-3 border-dashed border-white/15 px-6 py-16 text-center">
          <Radio className="h-10 w-10 text-cyan-400/80" aria-hidden />
          <div>
            <p className="font-medium text-white">No devices match your filters</p>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              {devices.length === 0
                ? 'No devices in the fleet yet. Seed data loads after the backend connects to Supabase, or register a device via telemetry ingest.'
                : 'Try clearing the search box or switching status to “All statuses”.'}
            </p>
          </div>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((device) => (
            <li key={device.id} className="card-glass px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-white">{device.name}</p>
                  <p className="text-xs text-slate-400">{device.id}</p>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
                  {device.status}
                </span>
                <div className="flex gap-4 text-xs text-slate-300">
                  <span>CPU {device.cpu != null ? `${device.cpu}%` : '—'}</span>
                  <span>
                    RAM{' '}
                    {(device.ram ?? device.memory) != null ? `${device.ram ?? device.memory}%` : '—'}
                  </span>
                  <span>{device.latency != null ? `${device.latency}ms` : '—'}</span>
                  <span>{device.firmware ?? '—'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
