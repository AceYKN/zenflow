import { DownloadSimple } from '@phosphor-icons/react'
import { useZenStore } from '@/store'
import { createDailyStats, getDateKey, getRecentDateKeys } from '@/utils/format'
import {
  getFlowCopy,
  getFlowIndex,
  getHeatmapStats,
  getLongestFocusSeconds,
  getTotalFocusSeconds,
  getWeekStats,
} from '@/utils/stats'
import { formatChineseDuration, formatDuration } from '@/utils/format'

export function StatsPanel() {
  const stats = useZenStore((state) => state.stats)
  const dailyGoalMinutes = useZenStore((state) => state.dailyGoalMinutes)
  const today = stats[getDateKey(new Date())] ?? createDailyStats()
  const week = getWeekStats(stats)
  const heatmap = getHeatmapStats(stats)
  const flowIndex = getFlowIndex(today, dailyGoalMinutes * 60)
  const segmentTotal = today.segments.morning + today.segments.afternoon + today.segments.evening || 1
  const morning = (today.segments.morning / segmentTotal) * 100
  const afternoon = (today.segments.afternoon / segmentTotal) * 100

  const exportCsv = () => {
    const rows = [
      ['date', 'focus_minutes', 'break_count', 'pomodoro_count', 'longest_minutes'],
      ...getRecentDateKeys(30).map((date) => {
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
        <StatCard label="历史总时长" value={formatChineseDuration(getTotalFocusSeconds(stats))} />
        <StatCard label="本周断点" value={`${Object.values(stats).reduce((sum, day) => sum + day.breakCount, 0)} 次`} />
        <StatCard label="最长连续" value={formatChineseDuration(getLongestFocusSeconds(stats))} />
      </div>
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
        <div className="legend"><span>上午</span><span>下午</span><span>晚上</span></div>
      </section>
      <section className="chart-panel">
        <h3>三十日热力</h3>
        <div className="heatmap">
          {heatmap.map((item) => {
            const max = Math.max(...heatmap.map((day) => day.seconds), 60)
            return <span key={item.date} title={`${item.date} · ${formatDuration(item.seconds)}`} style={{ opacity: 0.18 + (item.seconds / max) * 0.82 }} />
          })}
        </div>
      </section>
      <button className="export-button" type="button" onClick={exportCsv}>
        <DownloadSimple size={17} weight="thin" />
        导出 CSV
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

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
