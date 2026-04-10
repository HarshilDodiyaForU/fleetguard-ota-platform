import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[340px] max-w-[90vw] flex-col gap-2">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className="pointer-events-auto card-glass flex items-start justify-between gap-3 p-3"
        >
          <div className="flex items-start gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 text-rose-300" />
            )}
            <div>
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-xs text-slate-300">{toast.description}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="rounded p-1 text-slate-300 hover:bg-white/10"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </article>
      ))}
    </div>
  )
}
