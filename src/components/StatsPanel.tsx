import { DownloadSimple } from '@phosphor-icons/react'
import { useZenStore } from '@/store'
import { createDailyStats, getDateKey, getRecentDateKeys } from '@/utils/format'
import {
  getBestFocusDay,
  getCurrentStreak,
  getFlowCopy,
  getFlowIndex,
  getGoalProgress,
  getHeatmapStats,
  getLongestFocusSeconds,
  getRangeStats,
  getTotalBreakCount,
  getTotalFocusSeconds,
  getTotalPomodoroCount,
  getWeekStats,
} from '@/utils/stats'
import { formatChineseDuration, formatDuration } from '@/utils/format'

export function StatsPanel() {
  const stats = useZenStore((state) => state.stats)
  const dailyGoalMinutes = useZenStore((state) => state.dailyGoalMinutes)
  const today = stats[getDateKey(new Date())] ?? createDailyStats()
  const week = getWeekStats(stats)
  const heatmap = getHeatmapStats(stats, 112)
  const flowIndex = getFlowIndex(today, dailyGoalMinutes * 60)
  const goalProgress = getGoalProgress(today.focusSeconds, dailyGoalMinutes * 60)
  const weekSummary = getRangeStats(stats, 7)
  const monthSummary = getRangeStats(stats, 30)
  const seasonSummary = getRangeStats(stats, 112)
  const bestDay = getBestFocusDay(stats)
  const currentStreak = getCurrentStreak(stats)
  const segmentTotal = today.segments.morning + today.segments.afternoon + today.segments.evening || 1
  const morning = (today.segments.morning / segmentTotal) * 100
  const afternoon = (today.segments.afternoon / segmentTotal) * 100

  const exportCsv = () => {
    const rows = [
      ['date', 'focus_minutes', 'break_count', 'pomodoro_count', 'longest_minutes'],
      ...getRecentDateKeys(112).map((date) => {
        const day = stats[date] ?? createDailyStats(date)
        return [
          date,
          Math.round(day.focusSeconds / 60).toString(),
          day.breakCount.toString(),
          day.pomodoroCount.toString(),
          Math.round(day.longestFocusSeconds / 60).toString(),
        ]
      }),
    ]
    downloadText(`zenflow-stats-${getDateKey(new Date())}.csv`, rows.map((row) => row.join(',')).join('\n'), 'text/csv')
  }

  return (
    <section className="drawer-section">
      <div className="flow-card">
        <span>今日心流指数</span>
        <strong>{flowIndex}</strong>
        <div className="flow-line"><i style={{ width: `${flowIndex}%` }} /></div>
        <p>{getFlowCopy(flowIndex, today.focusSeconds)}</p>
      </div>
      <div className="stat-grid">
        <StatCard label="今日专注" value={formatChineseDuration(today.focusSeconds)} />
        <StatCard label="目标完成" value={`${goalProgress}%`} />
        <StatCard label="本周累计" value={formatChineseDuration(weekSummary.focusSeconds)} />
        <StatCard label="30 日累计" value={formatChineseDuration(monthSummary.focusSeconds)} />
        <StatCard label="历史总时长" value={formatChineseDuration(getTotalFocusSeconds(stats))} />
        <StatCard label="连续专注" value={`${currentStreak} 天`} />
        <StatCard label="最长连续" value={formatChineseDuration(getLongestFocusSeconds(stats))} />
        <StatCard label="本周番茄" value={`${weekSummary.pomodoroCount} 个`} />
        <StatCard label="断点提示" value={`${getTotalBreakCount(stats)} 次`} />
        <StatCard label="番茄总数" value={`${getTotalPomodoroCount(stats)} 个`} />
      </div>
      <section className="chart-panel">
        <h3>持续感</h3>
        <div className="milestone-list">
          <MetricRow label="近 30 日活跃" value={`${monthSummary.activeDays} 天`} ratio={(monthSummary.activeDays / 30) * 100} />
          <MetricRow label="近 16 周活跃" value={`${seasonSummary.activeDays} 天`} ratio={(seasonSummary.activeDays / 112) * 100} />
          <MetricRow label="活跃日均专注" value={formatChineseDuration(monthSummary.averageFocusSeconds)} ratio={(monthSummary.averageFocusSeconds / Math.max(dailyGoalMinutes * 60, 1)) * 100} />
          <MetricRow label="最佳单日" value={bestDay ? `${bestDay.date} · ${formatChineseDuration(bestDay.focusSeconds)}` : '暂无记录'} ratio={bestDay ? (bestDay.focusSeconds / Math.max(dailyGoalMinutes * 60, 1)) * 100 : 0} />
        </div>
      </section>
      <section className="chart-panel">
        <h3>近 7 天</h3>
        <div className="bar-chart">
          {week.map((seconds, index) => {
            const max = Math.max(...week, 60)
            return (
              <span key={`${index}-${seconds}`}>
                <i style={{ height: `${Math.max(8, (seconds / max) * 100)}%` }} />
                <em>{['一', '二', '三', '四', '五', '六', '日'][index]}</em>
              </span>
            )
          })}
        </div>
      </section>
      <section className="chart-panel donut-panel">
        <h3>今日时段</h3>
        <div
          className="donut"
          style={{
            background: `conic-gradient(var(--focus) 0 ${morning}%, var(--rest) ${morning}% ${morning + afternoon}%, var(--break) ${morning + afternoon}% 100%)`,
          }}
        />
        <div className="legend">
          <span><i className="legend-focus" />上午 {formatDuration(today.segments.morning)}</span>
          <span><i className="legend-rest" />下午 {formatDuration(today.segments.afternoon)}</span>
          <span><i className="legend-break" />晚上 {formatDuration(today.segments.evening)}</span>
        </div>
      </section>
      <section className="chart-panel">
        <h3>近 16 周热力</h3>
        <div className="heatmap">
          {heatmap.map((item) => {
            const max = Math.max(...heatmap.map((day) => day.seconds), 60)
            const level = Math.min(4, Math.ceil((item.seconds / max) * 4))
            return (
              <span
                data-level={level}
                key={item.date}
                title={`${item.date} · ${formatDuration(item.seconds)}`}
                style={{ opacity: 0.2 + (item.seconds / max) * 0.8 }}
              />
            )
          })}
        </div>
        <div className="heatmap-legend"><span>少</span><i data-level="1" /><i data-level="2" /><i data-level="3" /><i data-level="4" /><span>多</span></div>
      </section>
      <button className="export-button" type="button" onClick={exportCsv}>
        <DownloadSimple size={17} weight="thin" />
        导出 16 周 CSV
      </button>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function MetricRow({ label, ratio, value }: { label: string; ratio: number; value: string }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
      <i><b style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }} /></i>
    </div>
  )
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
