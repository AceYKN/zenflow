import type { DailyStats, DaySegment, TimerMode, TimerSettings } from '@/data'

export function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDaySegment(date: Date): DaySegment {
  const hour = date.getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export function createDailyStats(date = getDateKey(new Date())): DailyStats {
  return {
    date,
    focusSeconds: 0,
    breakCount: 0,
    pomodoroCount: 0,
    longestFocusSeconds: 0,
    segments: {
      morning: 0,
      afternoon: 0,
      evening: 0,
    },
  }
}

export function formatTimer(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60)
  const restSeconds = Math.max(0, seconds) % 60
  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}

export function formatDuration(seconds: number) {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours <= 0) return `${rest}m`
  return `${hours}h ${rest}m`
}

export function formatChineseDuration(seconds: number) {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours <= 0) return `${rest} 分钟`
  return `${hours} 小时 ${rest} 分钟`
}

export function chineseNumber(value: number) {
  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (value < 10) return digits[value]
  if (value === 10) return '十'
  if (value < 20) return `十${digits[value % 10]}`
  if (value % 10 === 0) return `${digits[Math.floor(value / 10)]}十`
  return `${digits[Math.floor(value / 10)]}十${digits[value % 10]}`
}

export function formatChineseDate(date: Date) {
  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
  const year = String(date.getFullYear())
    .split('')
    .map((digit) => digits[Number(digit)])
    .join('')

  return `${year}年${chineseNumber(date.getMonth() + 1)}月${chineseNumber(date.getDate())}日 · ${weekdays[date.getDay()]}`
}

export function getTimerDuration(mode: TimerMode, settings: TimerSettings) {
  if (mode === 'focus') return settings.focusMinutes * 60
  if (mode === 'short') return settings.shortMinutes * 60
  return settings.longMinutes * 60
}

export function getRecentDateKeys(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - index))
    return getDateKey(date)
  })
}
