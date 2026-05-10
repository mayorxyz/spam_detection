import type { PredictResponse } from '@/lib/api'

type Props = {
  breakdown: PredictResponse['breakdown']
}

function ScoreRow({
  label,
  pct,
  colorClass,
}: {
  label: string
  pct: number
  colorClass: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span className="tabular-nums text-zinc-200">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function BreakdownChart({ breakdown }: Props) {
  const nbPct = Math.min(100, Math.round(breakdown.nb * 100))
  const svmPct = Math.min(100, Math.round(breakdown.svm * 100))

  return (
    <div className="space-y-4" aria-label="Model score breakdown">
      <p className="text-sm font-medium text-zinc-300">NB vs SVM scores</p>
      <ScoreRow label="Naive Bayes" pct={nbPct} colorClass="bg-sky-500" />
      <ScoreRow label="SVM" pct={svmPct} colorClass="bg-fuchsia-500" />
    </div>
  )
}
