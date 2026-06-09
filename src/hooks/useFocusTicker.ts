import { useEffect, useRef } from 'react'
import { useZenStore } from '@/store'

export function useFocusTicker() {
  const focusActive = useZenStore((state) => state.focusActive)
  const addFocusSeconds = useZenStore((state) => state.addFocusSeconds)
  const lastTickRef = useRef<number | null>(null)

  useEffect(() => {
    if (!focusActive) {
      lastTickRef.current = null
      return
    }

    lastTickRef.current = Date.now()
    const timer = window.setInterval(() => {
      const now = Date.now()
      const delta = Math.max(1, Math.round((now - (lastTickRef.current ?? now)) / 1000))
      lastTickRef.current = now
      addFocusSeconds(delta)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [addFocusSeconds, focusActive])
}
