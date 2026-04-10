import { Activity, AlertTriangle, CheckCircle2, Cpu, Gauge, Layers, ShieldAlert } from 'lucide-react'

const levelConfig = {
  low: { label: 'Low', bar: 'bg-emerald-500', text: 'text-emerald-300', ring: 'border-emerald-400/40' },
  moderate: { label: 'Medium', bar: 'bg-amber-500', text: 'text-amber-300', ring: 'border-amber-400/40' },
  high: { label: 'High', bar: 'bg-rose-500', text: 'text-rose-300', ring: 'border-rose-400/40' },
}

const severityBadge = {
  low: 'bg-emerald-500/15 text-emerald-200',
  medium: 'bg-amber-500/15 text-amber-200',
  high: 'bg-rose-500/15 text-rose-200',
}

function factorIcon(key) {
  if (key === 'cpu') return Cpu
  if (key === 'latency') return Gauge
  if (key === 'firmware') return Layers
  return Activity
}

function normalizeFactors(factors) {
  if (!Array.isArray(factors)) return []
  return factors.map((f) =>
    typeof f === 'string'
      ? { key: f, title: f, detail: '', severity: 'medium' }
      : {
          key: f.key || f.title,
          title: f.title,
          detail: f.detail || '',
          severity: f.severity || 'medium',
        },
  )
}

export default function Risk({ risk, isLoading, loadError }) {
  const score = risk.riskScore
  const levelKey = risk.riskLevel === 'moderate' ? 'moderate' : risk.riskLevel === 'high' ? 'high' : 'low'
  const cfg = levelConfig[levelKey] || levelConfig.low
  const factors = normalizeFactors(risk.factors)

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-glass h-72 animate-pulse bg-white/5" />
        <div className="card-glass h-72 animate-pulse bg-white/5" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="card-glass mx-auto max-w-lg border border-rose-500/30 bg-rose-950/20 p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" aria-hidden />
        <p className="mt-4 font-medium text-white">Could not load risk analytics</p>
        <p className="mt-2 text-sm text-slate-400">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <article className="card-glass p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">ML Risk Score</h3>
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
            <span className={`h-2 w-2 rounded-full ${cfg.bar}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-400">0–100 scale · simulated inference from fleet telemetry</p>

        <div className="mt-6 flex justify-center">
          <div
            className={`relative grid h-52 w-52 place-items-center rounded-full border-8 ${cfg.ring} bg-white/[0.03]`}
          >
            <div className="absolute inset-3 rounded-full border border-white/10" />
            <div className="relative text-center">
              <p className={`text-5xl font-bold ${cfg.text}`}>{score}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400">Risk index</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </article>

      <article className="card-glass p-5">
        <h3 className="text-lg font-semibold text-white">Risk factors</h3>
        {factors.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
            No factor breakdown available.
          </p>
        ) : (
        <ul className="mt-4 space-y-3">
          {factors.map((factor) => {
            const Icon = factorIcon(factor.key)
            const sev = severityBadge[factor.severity] || severityBadge.medium
            return (
              <li key={factor.key || factor.title} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <div>
                      <p className="text-sm font-medium text-slate-100">{factor.title}</p>
                      {factor.detail ? (
                        <p className="mt-1 text-xs text-slate-400">{factor.detail}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${sev}`}>
                    {factor.severity}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
        )}

        <h4 className="mt-6 text-sm font-semibold text-white">Recommendations</h4>
        <ul className="mt-3 space-y-2 text-sm">
          {(risk.recommendations || []).map((item, index) => (
            <li key={item} className="flex items-start gap-2 text-slate-200">
              {index === 0 && <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />}
              {index === 1 && <AlertTriangle className="mt-0.5 h-4 w-4 text-cyan-300" />}
              {index === 2 && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}
