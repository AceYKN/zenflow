import { useEffect } from 'react'
import { useZenStore } from '@/store'

export function useBreakScheduler({
  inputFocused,
  onCue,
}: {
  inputFocused: boolean
  onCue: () => void
}) {
  const focusActive = useZenStore((state) => state.focusActive)
  const breakSettings = useZenStore((state) => state.breakSettings)
  const timer = useZenStore((state) => state.timer)
  const timerSettings = useZenStore((state) => state.timerSettings)

  useEffect(() => {
    if (!breakSettings.enabled || !focusActive) return
    if (timerSettings.enabled && timer.mode !== 'focus') return

    let cancelled = false
    let timeout: number | undefined

    const schedule = () => {
      const min = Math.min(breakSettings.minMinutes, breakSettings.maxMinutes)
      const max = Math.max(breakSettings.minMinutes, breakSettings.maxMinutes)
      const delay = (min + Math.random() * (max - min)) * 60 * 1000

      timeout = window.setTimeout(() => {
        if (cancelled) return
        const activeElement = document.activeElement as HTMLElement | null
        const isTyping = inputFocused || Boolean(activeElement?.closest('input, textarea, select, [contenteditable="true"]'))
        if (!document.hidden && !isTyping) {
          onCue()
        }
        schedule()
      }, delay)
    }

    schedule()

    return () => {
      cancelled = true
      if (timeout) window.clearTimeout(timeout)
    }
  }, [
    breakSettings.enabled,
    breakSettings.maxMinutes,
    breakSettings.minMinutes,
    focusActive,
    inputFocused,
    onCue,
    timer.mode,
    timerSettings.enabled,
  ])
}
