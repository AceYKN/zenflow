import { useEffect, useRef } from 'react'
import { useZenStore } from '@/store'
import { formatTimer } from '@/utils/format'

export function usePomodoroTimer() {
  const timer = useZenStore((state) => state.timer)
  const timerSettings = useZenStore((state) => state.timerSettings)
  const focusActive = useZenStore((state) => state.focusActive)
  const setTimerRemaining = useZenStore((state) => state.setTimerRemaining)
  const completeTimerMode = useZenStore((state) => state.completeTimerMode)
  const setFocusActive = useZenStore((state) => state.setFocusActive)
  const lastTickRef = useRef<number | null>(null)

  useEffect(() => {
    if (!timer.running) {
      lastTickRef.current = null
      document.title = 'ZenFlow · 静流'
      return
    }

    if (timer.mode === 'focus' && !focusActive) {
      setFocusActive(true)
    }

    lastTickRef.current = Date.now()
    const interval = window.setInterval(() => {
      const now = Date.now()
      const delta = Math.max(1, Math.round((now - (lastTickRef.current ?? now)) / 1000))
      lastTickRef.current = now
      const next = timer.remainingSeconds - delta
      if (next <= 0) {
        completeTimerMode()
        document.title = 'ZenFlow · 静流'
      } else {
        setTimerRemaining(next)
        document.title = `[${formatTimer(next)}] 静流 · ZenFlow`
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [
    completeTimerMode,
    focusActive,
    setFocusActive,
    setTimerRemaining,
    timer.mode,
    timer.remainingSeconds,
    timer.running,
    timerSettings,
  ])
}
