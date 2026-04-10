import { motion as FramerMotion } from 'framer-motion'

const statusColors = {
  green: 'bg-emerald-400 shadow-emerald-500/50',
  yellow: 'bg-amber-400 shadow-amber-500/50',
  red: 'bg-rose-400 shadow-rose-500/50',
  neutral: 'bg-slate-500 shadow-slate-600/40',
}

export default function StatCard({
  title,
  value,
  trend,
  tone = 'neutral',
  status = 'neutral',
  delay = 0,
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-300'
      : tone === 'warn'
        ? 'text-amber-300'
        : 'text-cyan-200'

  return (
    <FramerMotion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="card-glass group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
        <span
          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full shadow-lg ${statusColors[status] || statusColors.neutral}`}
          title="Status"
        />
      </div>
      <p className="relative mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className={`relative mt-2 text-xs ${toneClass}`}>{trend}</p>
    </FramerMotion.article>
  )
}
