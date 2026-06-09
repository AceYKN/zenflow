import { useEffect } from 'react'

export function useKeyboardShortcuts(actions: {
  closeDrawer: () => void
  toggleAudio: () => void
  toggleFocus: () => void
  toggleTimer: () => void
  openSettings: () => void
  openStats: () => void
  openNotes: () => void
  setClockStyle: (style: 'ink' | 'dial' | 'flip') => void
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = Boolean(target?.closest('input, textarea, select, [contenteditable="true"]'))
      if (typing) return

      if (event.key === 'Escape') actions.closeDrawer()
      if (event.key === ' ') {
        event.preventDefault()
        actions.toggleAudio()
      }
      if (event.key.toLowerCase() === 'f') actions.toggleFocus()
      if (event.key.toLowerCase() === 't') actions.toggleTimer()
      if (event.key.toLowerCase() === 'n') actions.openNotes()
      if (event.key.toLowerCase() === 's') actions.openStats()
      if (event.key === ',') actions.openSettings()
      if (event.key === '1') actions.setClockStyle('ink')
      if (event.key === '2') actions.setClockStyle('dial')
      if (event.key === '3') actions.setClockStyle('flip')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [actions])
}
