import type { DailyStats } from '@/data'
import { formatChineseDuration, getDateKey, getRecentDateKeys } from './format'

export function getTotalFocusSeconds(records: Record<string, DailyStats>) {
  return Object.values(records).reduce((total, day) => total + day.focusSeconds, 0)
}

export function getTotalBreakCount(records: Record<string, DailyStats>) {
  return Object.values(records).reduce((total, day) => total + day.breakCount, 0)
}

export function getTotalPomodoroCount(records: Record<string, DailyStats>) {
  return Object.values(records).reduce((total, day) => total + day.pomodoroCount, 0)
}

export function getLongestFocusSeconds(records: Record<string, DailyStats>) {
  return Object.values(records).reduce((longest, day) => Math.max(longest, day.longestFocusSeconds), 0)
}

export function getWeekStats(records: Record<string, DailyStats>) {
  return getRecentDateKeys(7).map((date) => records[date]?.focusSeconds ?? 0)
}

export function getRangeStats(records: Record<string, DailyStats>, days: number) {
  const keys = getRecentDateKeys(days)
  const focusSeconds = keys.reduce((sum, date) => sum + (records[date]?.focusSeconds ?? 0), 0)
  const breakCount = keys.reduce((sum, date) => sum + (records[date]?.breakCount ?? 0), 0)
  const pomodoroCount = keys.reduce((sum, date) => sum + (records[date]?.pomodoroCount ?? 0), 0)
  const activeDays = keys.filter((date) => (records[date]?.focusSeconds ?? 0) > 0).length

  return {
    activeDays,
    averageFocusSeconds: Math.round(focusSeconds / Math.max(activeDays, 1)),
    breakCount,
    focusSeconds,
    pomodoroCount,
  }
}

export function getHeatmapStats(records: Record<string, DailyStats>, days = 112) {
  return getRecentDateKeys(days).map((date) => ({
    date,
    seconds: records[date]?.focusSeconds ?? 0,
  }))
}

export function getCurrentStreak(records: Record<string, DailyStats>) {
  let streak = 0
  let cursor = new Date()

  while (true) {
    const key = getDateKey(cursor)
    if ((records[key]?.focusSeconds ?? 0) <= 0) break
    streak += 1
    cursor = new Date(cursor)
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function getBestFocusDay(records: Record<string, DailyStats>) {
  return Object.values(records).reduce<DailyStats | null>((best, day) => {
    if (day.focusSeconds <= 0) return best
    if (!best || day.focusSeconds > best.focusSeconds) return day
    return best
  }, null)
}

export function getGoalProgress(focusSeconds: number, dailyGoalSeconds: number) {
  return Math.min(100, Math.round((focusSeconds / Math.max(dailyGoalSeconds, 1)) * 100))
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
