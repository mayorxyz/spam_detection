import { WifiOff } from 'lucide-react'

export function ApiOfflineBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-amber-900/60 bg-amber-950/90 px-4 py-2 text-center text-sm text-amber-100"
      role="status"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        API offline — start the backend with <code className="rounded bg-black/30 px-1">python app.py</code> on port 5000.
      </span>
    </div>
  )
}
