import { useZenStore } from '@/store'
import { createDailyStats, formatChineseDuration, getDateKey } from '@/utils/format'

export function BottomStatus() {
  const dailyGoalMinutes = useZenStore((state) => state.dailyGoalMinutes)
  const focusActive = useZenStore((state) => state.focusActive)
  const soundPlaying = useZenStore((state) => state.soundPlaying)
  const stats = useZenStore((state) => state.stats)
  const today = stats[getDateKey(new Date())] ?? createDailyStats()
  const progress = Math.min(today.focusSeconds / Math.max(dailyGoalMinutes * 60, 1), 1) * 100

  return (
    <footer className="bottom-status">
      <span>{focusActive ? '专注中' : '未专注'}</span>
      <span>今日 {formatChineseDuration(today.focusSeconds)}</span>
      <i><b style={{ width: `${progress}%` }} /></i>
      <span>目标 {Math.round(dailyGoalMinutes / 60)}h</span>
      <span>{soundPlaying ? '声音流动中' : '静音'}</span>
    </footer>
  )
}
