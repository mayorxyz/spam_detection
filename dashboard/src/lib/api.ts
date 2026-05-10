const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:5000'

export type Channel = 'sms' | 'email' | 'social'

export type PredictResponse = {
  label: 'SPAM' | 'HAM'
  confidence: number
  breakdown: { nb: number; svm: number }
  latency_ms?: number
}

export type HistoryRow = {
  text: string
  channel: string
  label: string
  confidence: number
  timestamp: string
}

export async function predict(text: string, channel: Channel): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, channel }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<PredictResponse>
}

export async function fetchHistory(): Promise<HistoryRow[]> {
  const res = await fetch(`${API_BASE}/history`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<HistoryRow[]>
}

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal, cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}

export { API_BASE }
