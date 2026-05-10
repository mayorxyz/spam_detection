import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import type { DashboardOutletContext } from '@/components/AppShell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { predict, type Channel, type PredictResponse } from '@/lib/api'
import { cn } from '@/lib/utils'

type Sample = {
  id: string
  from: string
  channel: Channel
  preview: string
  body: string
}

const SAMPLES: Sample[] = [
  {
    id: '1',
    from: '+1 (555) 019-992',
    channel: 'sms',
    preview: 'Prize winner',
    body: 'Congratulations! You won a free iPhone. Click http://spam.example/claim now!',
  },
  {
    id: '2',
    from: 'Mom',
    channel: 'sms',
    preview: 'Dinner',
    body: 'Are we still meeting at 7? Let me know if you need a ride.',
  },
  {
    id: '3',
    from: 'noreply@bank.example',
    channel: 'email',
    preview: 'Security alert',
    body: '<p>Your account will be closed. Verify your password at http://evil.example</p>',
  },
  {
    id: '4',
    from: 'team@company.com',
    channel: 'email',
    preview: 'Q3 roadmap',
    body: 'Hi team, attached is the roadmap draft. Feedback by Friday please.',
  },
  {
    id: '5',
    from: '@trendsetter',
    channel: 'social',
    preview: 'DM',
    body: 'I made $5000 in a day using this trick. DM me “INFO” for details!!!',
  },
  {
    id: '6',
    from: '@friend',
    channel: 'social',
    preview: 'Meetup',
    body: 'Coffee tomorrow? Same place as usual works for me.',
  },
]

type Enriched = Sample & { result: PredictResponse | null; loading: boolean; error?: string }

export function InboxPage() {
  const { refreshHistory } = useOutletContext<DashboardOutletContext>()
  const [items, setItems] = useState<Enriched[]>(() =>
    SAMPLES.map((s) => ({ ...s, result: null, loading: true })),
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const next: Enriched[] = []
      for (const s of SAMPLES) {
        try {
          const result = await predict(s.body, s.channel)
          if (cancelled) return
          next.push({ ...s, result, loading: false })
          setItems((prev) => {
            const merged = [...prev]
            const i = merged.findIndex((x) => x.id === s.id)
            if (i >= 0) merged[i] = { ...s, result, loading: false }
            return merged
          })
        } catch {
          if (cancelled) return
          setItems((prev) => {
            const merged = [...prev]
            const i = merged.findIndex((x) => x.id === s.id)
            if (i >= 0)
              merged[i] = {
                ...s,
                result: null,
                loading: false,
                error: 'Classification failed',
              }
            return merged
          })
        }
      }
      await refreshHistory()
    })()
    return () => {
      cancelled = true
    }
  }, [refreshHistory])

  const selected = items.find((i) => i.id === selectedId) ?? null

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Simulated inbox</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sample threads are classified on load. Spam threads look muted with a red tag.
          </p>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
            <p className="text-sm font-medium text-zinc-200">Messages</p>
            <p className="text-xs text-zinc-500">Tap a row for confidence details</p>
          </div>
          <ul className="divide-y divide-zinc-800">
            {items.map((row) => {
              const isSpam = row.result?.label === 'SPAM'
              const active = row.id === selectedId
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={cn(
                      'flex w-full gap-3 px-4 py-3 text-left transition-colors',
                      active ? 'bg-zinc-800/80' : 'hover:bg-zinc-900/80',
                      isSpam ? 'opacity-75' : null,
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-zinc-200">
                          {row.from}
                        </span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                          {row.channel}
                        </span>
                        {row.loading ? (
                          <span className="text-xs text-zinc-500">Classifying…</span>
                        ) : row.result ? (
                          <Badge variant={isSpam ? 'spam' : 'ham'}>{row.result.label}</Badge>
                        ) : (
                          <span className="text-xs text-red-400">{row.error ?? '—'}</span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'truncate text-sm',
                          isSpam ? 'text-zinc-500 line-through' : 'text-zinc-300',
                        )}
                      >
                        {row.preview} — {row.body}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <div className="w-full shrink-0 lg:w-80">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Scores for the selected message.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selected ? (
              <p className="text-sm text-zinc-500">Select a message from the list.</p>
            ) : selected.loading ? (
              <p className="text-sm text-zinc-500">Still classifying…</p>
            ) : selected.result ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={selected.result.label === 'SPAM' ? 'spam' : 'ham'}>
                    {selected.result.label}
                  </Badge>
                  <span className="text-sm text-zinc-400">
                    {(selected.result.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
                <Separator />
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">Naive Bayes</dt>
                    <dd className="tabular-nums text-zinc-200">
                      {(selected.result.breakdown.nb * 100).toFixed(1)}%
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">SVM</dt>
                    <dd className="tabular-nums text-zinc-200">
                      {(selected.result.breakdown.svm * 100).toFixed(1)}%
                    </dd>
                  </div>
                </dl>
                <p className="text-xs leading-relaxed text-zinc-500">{selected.body}</p>
              </>
            ) : (
              <p className="text-sm text-red-400">{selected.error ?? 'No result'}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
