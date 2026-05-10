import { BarChart3 } from 'lucide-react'

import type { TodayStats } from '@/lib/stats'

type Props = {
  stats: TodayStats
}

export function StatsBar({ stats }: Props) {
  const avg =
    stats.avgConfidence != null ? `${(stats.avgConfidence * 100).toFixed(1)}%` : '—'

  const items = [
    { label: 'Classified today', value: String(stats.totalToday) },
    { label: 'Spam', value: String(stats.spam) },
    { label: 'Ham', value: String(stats.ham) },
    { label: 'Avg confidence', value: avg },
  ]

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex flex-wrap items-stretch gap-px bg-zinc-800 sm:flex-nowrap">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex min-w-[140px] flex-1 flex-col justify-center gap-0.5 bg-zinc-950 px-4 py-3 sm:min-w-0"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
              {item.label === 'Classified today' ? (
                <BarChart3 className="h-3.5 w-3.5" aria-hidden />
              ) : null}
              {item.label}
            </span>
            <span className="text-lg font-semibold tabular-nums text-zinc-100">{item.value}</span>
          </div>
        ))}
      </div>
    </header>
  )
}
