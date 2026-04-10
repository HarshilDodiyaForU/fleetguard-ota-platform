import { createElement, memo } from 'react'
import { Cpu, HardDrive, Signal, Wifi } from 'lucide-react'
import { statusClassName } from '../../utils/formatters'

function DeviceCardComponent({ device }) {
  return (
    <article className="card-glass p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-white">{device.name}</h4>
          <p className="truncate text-xs text-slate-500">{device.id}</p>
          <p className="text-xs text-slate-400">{device.region}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusClassName(device.status)}`}>
          {device.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-200">
        <Metric
          icon={Cpu}
          label="CPU"
          value={device.cpu != null && device.cpu !== '' ? `${device.cpu}%` : '—'}
        />
        <Metric
          icon={HardDrive}
          label="RAM"
          value={
            device.ram != null || device.memory != null
              ? `${device.ram ?? device.memory}%`
              : '—'
          }
        />
        <Metric
          icon={Signal}
          label="Latency"
          value={
            device.latency != null && device.latency !== '' ? `${device.latency}ms` : '—'
          }
        />
        <Metric icon={Wifi} label="Firmware" value={device.firmware ?? '—'} />
      </div>
    </article>
  )
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="flex items-center gap-2 text-slate-400">
        {createElement(icon, { className: 'h-3.5 w-3.5' })}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  )
}

export default memo(DeviceCardComponent)
