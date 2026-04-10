import { Loader2 } from 'lucide-react'

export default function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-cyan-400" aria-label="Loading" />
    </div>
  )
}
