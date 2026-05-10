import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { BreakdownChart } from '@/components/BreakdownChart'
import type { DashboardOutletContext } from '@/components/AppShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { predict, type Channel, type PredictResponse } from '@/lib/api'

export function ClassifierPage() {
  const { refreshHistory } = useOutletContext<DashboardOutletContext>()
  const [text, setText] = useState('')
  const [channel, setChannel] = useState<Channel>('sms')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictResponse | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!text.trim()) {
      setError('Enter a message to classify.')
      return
    }
    setLoading(true)
    try {
      const res = await predict(text.trim(), channel)
      setResult(res)
      await refreshHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Classifier</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Paste a message, pick a channel, and run the ensemble model.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
          <CardDescription>Text is sent to POST /predict on your API.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Textarea
              placeholder="e.g. Congratulations! You’ve won a $1000 gift card. Click here now…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              aria-label="Message to classify"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="channel-select">
                  Channel
                </label>
                <Select
                  value={channel}
                  onValueChange={(v) => setChannel(v as Channel)}
                >
                  <SelectTrigger id="channel-select" aria-label="Channel">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="sm:shrink-0">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    Classifying…
                  </>
                ) : (
                  'Classify'
                )}
              </Button>
            </div>

            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Label and model breakdown from the API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={result.label === 'SPAM' ? 'spam' : 'ham'} className="text-sm">
                {result.label}
              </Badge>
              <span className="text-sm text-zinc-400">
                Confidence{' '}
                <span className="font-semibold tabular-nums text-zinc-100">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </span>
              {result.latency_ms != null ? (
                <span className="text-xs text-zinc-500">{result.latency_ms} ms</span>
              ) : null}
            </div>
            <BreakdownChart breakdown={result.breakdown} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
