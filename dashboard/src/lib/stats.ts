import type { HistoryRow } from '@/lib/api'

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export type TodayStats = {
  totalToday: number
  spam: number
  ham: number
  avgConfidence: number | null
}

export function computeTodayStats(rows: HistoryRow[]): TodayStats {
  const start = startOfToday().getTime()
  const today = rows.filter((r) => {
    const t = new Date(r.timestamp).getTime()
    return !Number.isNaN(t) && t >= start
  })
  const spam = today.filter((r) => r.label === 'SPAM').length
  const ham = today.filter((r) => r.label === 'HAM').length
  const sum = today.reduce((acc, r) => acc + (Number(r.confidence) || 0), 0)
  const avgConfidence = today.length ? sum / today.length : null
  return {
    totalToday: today.length,
    spam,
    ham,
    avgConfidence,
  }
}
