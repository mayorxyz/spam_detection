import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import type { DashboardOutletContext } from '@/components/AppShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

function preview(text: string, max = 72) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

function formatChannel(ch: string) {
  if (ch === 'sms') return 'SMS'
  if (ch === 'email') return 'Email'
  if (ch === 'social') return 'Social'
  return ch
}

function formatTime(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export function HistoryPage() {
  const { refreshHistory, historyRows: rows } = useOutletContext<DashboardOutletContext>()
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      await refreshHistory()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">History log</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Last 50 predictions from <code className="text-zinc-300">GET /history</code>.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} aria-hidden />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Predictions</CardTitle>
          <CardDescription>Spam rows use a light red background.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Message</TableHead>
                <TableHead className="hidden sm:table-cell">Channel</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="hidden md:table-cell">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center text-sm text-zinc-500">
                    No predictions yet. Run the classifier or inbox simulation.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => {
                  const spam = row.label === 'SPAM'
                  return (
                    <TableRow
                      key={`${row.timestamp}-${i}`}
                      className={cn(spam ? 'bg-red-950/35 hover:bg-red-950/45' : undefined)}
                    >
                      <TableCell className="max-w-[220px] text-zinc-200 sm:max-w-md">
                        <span className="line-clamp-2">{preview(row.text)}</span>
                        <span className="mt-1 block text-xs text-zinc-500 sm:hidden">
                          {formatChannel(row.channel)} · {formatTime(row.timestamp)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-zinc-400 sm:table-cell">
                        {formatChannel(row.channel)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={spam ? 'spam' : 'ham'}>{row.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{row.category ?? 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-zinc-200">
                        {(Number(row.confidence) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="hidden text-zinc-400 md:table-cell">
                        {formatTime(row.timestamp)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
