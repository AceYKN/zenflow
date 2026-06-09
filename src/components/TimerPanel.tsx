import { Pause, Play } from '@phosphor-icons/react'
import { timerModeLabels, type TimerMode } from '@/data'
import { useZenStore } from '@/store'
import { formatTimer, getTimerDuration } from '@/utils/format'
import { NumberField } from './NumberField'

export function TimerPanel() {
  const timer = useZenStore((state) => state.timer)
  const timerSettings = useZenStore((state) => state.timerSettings)
  const setTimerMode = useZenStore((state) => state.setTimerMode)
  const setTimerRunning = useZenStore((state) => state.setTimerRunning)
  const setTimerSettings = useZenStore((state) => state.setTimerSettings)
  const resetTimer = useZenStore((state) => state.resetTimer)
  const radius = 47
  const circumference = Math.PI * 2 * radius
  const duration = getTimerDuration(timer.mode, timerSettings)
  const progress = 1 - timer.remainingSeconds / Math.max(duration, 1)

  return (
    <section className="drawer-section">
      <label className="switch-row">
        <span>
          <strong>启用番茄钟</strong>
          <small>番茄钟与专注状态协同，但不控制环境音。</small>
        </span>
        <span className="switch">
          <input
            type="checkbox"
            checked={timerSettings.enabled}
            onChange={(event) => setTimerSettings((current) => ({ ...current, enabled: event.target.checked }))}
          />
          <i />
        </span>
      </label>

      <div className="timer-hero">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} />
          <circle
            className="timer-progress"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <strong>{formatTimer(timer.remainingSeconds)}</strong>
      </div>

      <div className="segmented">
        {(Object.keys(timerModeLabels) as TimerMode[]).map((mode) => (
          <button className={timer.mode === mode ? 'active' : ''} key={mode} type="button" onClick={() => setTimerMode(mode)}>
            {timerModeLabels[mode]}
          </button>
        ))}
      </div>
      <div className="timer-actions">
        <button type="button" onClick={() => setTimerRunning(!timer.running)}>
          {timer.running ? <Pause size={18} weight="thin" /> : <Play size={18} weight="thin" />}
          {timer.running ? '暂停' : '开始'}
        </button>
        <button type="button" onClick={resetTimer}>重置</button>
      </div>
      <div className="break-settings">
        <NumberField
          label="专注"
          suffix="分钟"
          min={10}
          max={90}
          value={timerSettings.focusMinutes}
          onChange={(value) => setTimerSettings((current) => ({ ...current, focusMinutes: value }))}
        />
        <NumberField
          label="短休"
          suffix="分钟"
          min={3}
          max={15}
          value={timerSettings.shortMinutes}
          onChange={(value) => setTimerSettings((current) => ({ ...current, shortMinutes: value }))}
        />
        <NumberField
          label="长休"
          suffix="分钟"
          min={10}
          max={30}
          value={timerSettings.longMinutes}
          onChange={(value) => setTimerSettings((current) => ({ ...current, longMinutes: value }))}
        />
      </div>
    </section>
  )
}
