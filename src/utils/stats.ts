import type { DailyStats } from '@/data'
import { formatChineseDuration, getRecentDateKeys } from './format'

export function getTotalFocusSeconds(records: Record<string, DailyStats>) {
  return Object.values(records).reduce((total, day) => total + day.focusSeconds, 0)
}

export function getLongestFocusSeconds(records: Record<string, DailyStats>) {
  return Object.values(records).reduce((longest, day) => Math.max(longest, day.longestFocusSeconds), 0)
}

export function getWeekStats(records: Record<string, DailyStats>) {
  return getRecentDateKeys(7).map((date) => records[date]?.focusSeconds ?? 0)
}

export function getHeatmapStats(records: Record<string, DailyStats>) {
  return getRecentDateKeys(30).map((date) => ({
    date,
    seconds: records[date]?.focusSeconds ?? 0,
  }))
}

export function getFlowIndex(today: DailyStats, dailyGoalSeconds: number) {
  const focusScore = Math.min(today.focusSeconds / Math.max(dailyGoalSeconds, 1), 1) * 40
  const pomodoroScore = Math.min(today.pomodoroCount / 4, 1) * 20
  const breakScore = Math.min(today.breakCount / 6, 1) * 20
  const longestScore = Math.min(today.longestFocusSeconds / Math.max(45 * 60, 1), 1) * 20
  return Math.round(focusScore + pomodoroScore + breakScore + longestScore)
}

export function getFlowCopy(index: number, seconds: number) {
  if (index >= 80) return `今天，你在最深处流连了 ${formatChineseDuration(seconds)}。`
  if (index >= 60) return '静水深流，今天你走得扎实。'
  if (index >= 40) return '涟漪已起，明日再深一些。'
  return '今天的留白，也是一种积累。'
}
