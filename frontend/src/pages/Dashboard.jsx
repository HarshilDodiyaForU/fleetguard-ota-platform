import { useMemo } from 'react'
import { motion as FramerMotion } from 'framer-motion'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import { useRealtime } from '../context/RealtimeContext'

const PIE_COLORS = ['#38BDF8', '#818CF8', '#A78BFA', '#2DD4BF']

function buildDistribution(devices) {
  const summary = devices.reduce((acc, device) => {
    acc[device.status] = (acc[device.status] || 0) + 1
    return acc
  }, {})
  return Object.entries(summary).map(([name, value]) => ({ name, value }))
}

function buildKpisFromDevices(devices) {
  const totalDevices = devices.length
  const healthy = devices.filter((d) => d.status === 'healthy').length
  const updating = devices.filter((d) => d.status === 'updating').length
  const warning = devices.filter((d) => d.status === 'warning').length
  const failed = devices.filter((d) => d.status === 'failed').length
  const healthScore =
    totalDevices === 0 ? 0 : Math.round(((healthy + updating + warning) / totalDevices) * 100)
  return {
    totalDevices,
    healthScore,
    activeRollouts: updating,
    failedToday: failed,
  }
}

function kpiStatus({ failedToday, healthScore, activeRollouts }) {
  if (failedToday > 8) return 'red'
  if (failedToday > 3 || healthScore < 70) return 'yellow'
  if (activeRollouts > 0 && healthScore < 85) return 'yellow'
  return 'green'
}

export default function Dashboard({ isLoading, kpis, successTrend, distribution, activityFeed }) {
  const { liveDevices, liveDeployment } = useRealtime()

  const mergedKpis = useMemo(() => {
    if (liveDevices !== null) {
      return buildKpisFromDevices(liveDevices)
    }
    return kpis
  }, [liveDevices, kpis])

  const mergedDistribution = useMemo(() => {
    if (liveDevices !== null) {
      return buildDistribution(liveDevices)
    }
    return distribution
  }, [liveDevices, distribution])

  const mergedActivityFeed = useMemo(() => {
    let feed = activityFeed
    if (liveDeployment) {
      const entry = {
        id: `deploy-${liveDeployment.id}-${liveDeployment.progress}`,
        message: `Deployment ${liveDeployment.status} — ${liveDeployment.progress}% (${liveDeployment.strategy || 'OTA'})`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      feed = [entry, ...activityFeed]
    }
    return feed
  }, [liveDeployment, activityFeed])

  const chartKey = useMemo(
    () => successTrend.map((p) => `${p.day}-${p.rate}`).join('|'),
    [successTrend],
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`stat-skeleton-${index}`}
              className="card-glass h-28 animate-pulse border-white/10 bg-white/5"
            />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="card-glass h-80 animate-pulse bg-white/5 xl:col-span-2" />
          <div className="card-glass h-80 animate-pulse bg-white/5" />
        </div>
      </div>
    )
  }

  const s1 = kpiStatus({
    failedToday: mergedKpis.failedToday,
    healthScore: mergedKpis.healthScore,
    activeRollouts: mergedKpis.activeRollouts,
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Devices"
          value={mergedKpis.totalDevices}
          trend="Fleet-wide live count"
          tone="good"
          status={s1}
          delay={0}
        />
        <StatCard
          title="Healthy Nodes"
          value={`${mergedKpis.healthScore}%`}
          trend="Composite availability index"
          tone="good"
          status={mergedKpis.healthScore >= 80 ? 'green' : 'yellow'}
          delay={0.05}
        />
        <StatCard
          title="Active Rollouts"
          value={mergedKpis.activeRollouts}
          trend="Devices in updating state"
          tone="neutral"
          status={mergedKpis.activeRollouts > 0 ? 'yellow' : 'green'}
          delay={0.1}
        />
        <StatCard
          title="Failed"
          value={mergedKpis.failedToday}
          trend="Nodes requiring attention"
          tone="warn"
          status={mergedKpis.failedToday > 3 ? 'red' : mergedKpis.failedToday > 0 ? 'yellow' : 'green'}
          delay={0.15}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <FramerMotion.article
          layout
          className="card-glass p-4 xl:col-span-2"
          transition={{ duration: 0.3 }}
        >
          <h3 className="mb-4 text-sm font-medium text-slate-200">OTA Success Rate (7 day)</h3>
          <div className="h-72">
            {successTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-slate-400">
                No trend data loaded yet.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={chartKey} data={successTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94A3B8" />
                <YAxis domain={[70, 100]} stroke="#94A3B8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#22D3EE"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={600}
                />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </FramerMotion.article>

        <FramerMotion.article layout className="card-glass p-4" transition={{ duration: 0.3 }}>
          <h3 className="mb-4 text-sm font-medium text-slate-200">Device Distribution</h3>
          <div className="h-72">
            {mergedDistribution.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-slate-400">
                No device status data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mergedDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    isAnimationActive
                    animationDuration={550}
                  >
                    {mergedDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </FramerMotion.article>
      </div>

      <article className="card-glass p-4">
        <h3 className="mb-4 text-sm font-medium text-slate-200">Live Activity Feed</h3>
        <div className="activity-feed-scroll max-h-72 overflow-y-auto pr-1">
          {mergedActivityFeed.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-400">
              No recent activity yet. Fleet telemetry and rollout events will appear here.
            </p>
          ) : (
            <ul className="space-y-3">
              {mergedActivityFeed.map((item) => (
                <FramerMotion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-100">{item.message}</p>
                    <span className="shrink-0 text-xs text-cyan-300">{item.time}</span>
                  </div>
                </FramerMotion.li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </div>
  )
}
