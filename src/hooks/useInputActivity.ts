import { useEffect, useState } from 'react'

export function useInputActivity() {
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    const focusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null
      setInputFocused(Boolean(target?.closest('input, textarea, select, [contenteditable="true"]')))
    }
    const focusOut = () => window.setTimeout(() => setInputFocused(false), 0)

    document.addEventListener('focusin', focusIn)
    document.addEventListener('focusout', focusOut)

    return () => {
      document.removeEventListener('focusin', focusIn)
      document.removeEventListener('focusout', focusOut)
    }
  }, [])

  return inputFocused
}
