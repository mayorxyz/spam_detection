import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '@/lib/api'

const POLL_MS = 15_000

export function useApiHealth() {
  const [online, setOnline] = useState(true)
  const [checking, setChecking] = useState(true)

  const runCheck = useCallback(async () => {
    const ctrl = new AbortController()
    const t = window.setTimeout(() => ctrl.abort(), 4000)
    try {
      const ok = await checkHealth(ctrl.signal)
      setOnline(ok)
    } catch {
      setOnline(false)
    } finally {
      window.clearTimeout(t)
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    const kick = window.setTimeout(() => void runCheck(), 0)
    const id = window.setInterval(() => void runCheck(), POLL_MS)
    return () => {
      window.clearTimeout(kick)
      window.clearInterval(id)
    }
  }, [runCheck])

  return { online, checking, recheck: runCheck }
}
