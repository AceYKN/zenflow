import { Bell } from '@phosphor-icons/react'
import { type BreakIntensity } from '@/data'
import { useZenStore } from '@/store'
import { NumberField } from './NumberField'

const intensityLabels: Record<BreakIntensity, string> = {
  gentle: '轻柔',
  standard: '标准',
  strong: '强提醒',
}

export function BreakPanel({ onTestBreak }: { onTestBreak: () => void }) {
  const breakSettings = useZenStore((state) => state.breakSettings)
  const focusActive = useZenStore((state) => state.focusActive)
  const setBreakSettings = useZenStore((state) => state.setBreakSettings)

  return (
    <section className="drawer-section">
      <label className="switch-row">
        <span>
          <strong>启用随机提示音</strong>
          <small>只响一声短提示音；不暂停环境音，不弹遮罩。</small>
        </span>
        <span className="switch">
          <input
            type="checkbox"
            checked={breakSettings.enabled}
            onChange={(event) => setBreakSettings((current) => ({ ...current, enabled: event.target.checked }))}
          />
          <i />
        </span>
      </label>
      <p className="notice">触发条件：专注中、页面可见、没有正在输入。用户听到提示音后自行放空或回忆 {breakSettings.recallSeconds} 秒。</p>
      <div className="segmented">
        {(Object.keys(intensityLabels) as BreakIntensity[]).map((intensity) => (
          <button
            className={breakSettings.intensity === intensity ? 'active' : ''}
            key={intensity}
            type="button"
            onClick={() => setBreakSettings((current) => ({ ...current, intensity }))}
          >
            {intensityLabels[intensity]}
          </button>
        ))}
      </div>
      <div className="break-settings">
        <NumberField
          label="最小间隔"
          suffix="分钟"
          min={5}
          max={45}
          value={breakSettings.minMinutes}
          onChange={(value) => setBreakSettings((current) => ({ ...current, minMinutes: value }))}
        />
        <NumberField
          label="最大间隔"
          suffix="分钟"
          min={10}
          max={60}
          value={breakSettings.maxMinutes}
          onChange={(value) => setBreakSettings((current) => ({ ...current, maxMinutes: value }))}
        />
        <NumberField
          label="回忆时长"
          suffix="秒"
          min={3}
          max={10}
          value={breakSettings.recallSeconds}
          onChange={(value) => setBreakSettings((current) => ({ ...current, recallSeconds: value }))}
        />
      </div>
      <label className="slider-row">
        <span>叮声音量</span>
        <input
          type="range"
          min="0"
          max="100"
          value={breakSettings.cueVolume}
          onChange={(event) => setBreakSettings((current) => ({ ...current, cueVolume: Number(event.target.value) }))}
        />
        <strong>{breakSettings.cueVolume}%</strong>
      </label>
      <button className="test-break" type="button" onClick={onTestBreak} disabled={!focusActive}>
        <Bell size={18} weight="thin" />
        播放一次提示音
      </button>
    </section>
  )
}
