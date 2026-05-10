import { History, Inbox, LayoutDashboard, Shield } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { ApiOfflineBanner } from '@/components/ApiOfflineBanner'
import { StatsBar } from '@/components/StatsBar'
import { Separator } from '@/components/ui/separator'
import { useApiHealth } from '@/hooks/useApiHealth'
import { fetchHistory, type HistoryRow } from '@/lib/api'
import { computeTodayStats } from '@/lib/stats'

const nav = [
  { to: '/', label: 'Classifier', icon: LayoutDashboard },
  { to: '/inbox', label: 'Simulated inbox', icon: Inbox },
  { to: '/history', label: 'History', icon: History },
] as const

export type DashboardOutletContext = {
  refreshHistory: () => Promise<void>
  historyRows: HistoryRow[]
}

export function AppShell() {
  const { online } = useApiHealth()
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([])

  const refreshHistory = useCallback(async () => {
    try {
      const rows = await fetchHistory()
      setHistoryRows(rows)
    } catch {
      setHistoryRows([])
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshHistory()
    }, 0)
    return () => window.clearTimeout(t)
  }, [refreshHistory])

  const stats = useMemo(() => computeTodayStats(historyRows), [historyRows])

  const outletCtx = useMemo(
    () => ({ refreshHistory, historyRows }),
    [refreshHistory, historyRows],
  )

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-zinc-800 bg-zinc-900/40 md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300">
            <Shield className="h-5 w-5" aria-hidden />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight text-zinc-100">Spam dashboard</p>
            <p className="text-xs text-zinc-500">Multi-channel</p>
          </div>
        </div>
        <Separator />
        <nav className="flex gap-1 p-2 md:flex-col" aria-label="Main">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {!online ? <ApiOfflineBanner /> : null}
        <StatsBar stats={stats} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={outletCtx} />
        </main>
      </div>
    </div>
  )
}
