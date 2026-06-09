import { DownloadSimple, UploadSimple, Warning } from '@phosphor-icons/react'
import { type ChangeEvent, useRef } from 'react'
import type { ClockStyle, ThemeMode, TimeFormat } from '@/data'
import { useZenStore } from '@/store'
import { getDateKey } from '@/utils/format'
import { NumberField } from './NumberField'

export function SettingsPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const backgroundMotion = useZenStore((state) => state.backgroundMotion)
  const clockStyle = useZenStore((state) => state.clockStyle)
  const dailyGoalMinutes = useZenStore((state) => state.dailyGoalMinutes)
  const theme = useZenStore((state) => state.theme)
  const timeFormat = useZenStore((state) => state.timeFormat)
  const clearAllData = useZenStore((state) => state.clearAllData)
  const importSnapshot = useZenStore((state) => state.importSnapshot)
  const setBackgroundMotion = useZenStore((state) => state.setBackgroundMotion)
  const setClockStyle = useZenStore((state) => state.setClockStyle)
  const setDailyGoalMinutes = useZenStore((state) => state.setDailyGoalMinutes)
  const setTheme = useZenStore((state) => state.setTheme)
  const setTimeFormat = useZenStore((state) => state.setTimeFormat)

  const exportJson = () => {
    const raw = localStorage.getItem('zenflow-storage') ?? '{}'
    downloadText(`zenflow-data-${getDateKey(new Date())}.json`, raw, 'application/json')
  }

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const parsed = JSON.parse(text) as { state?: object }
    if (parsed.state) importSnapshot(parsed.state)
    event.target.value = ''
  }

  const clear = () => {
    if (window.prompt('输入“确认”以清除所有本地数据') === '确认') {
      clearAllData()
    }
  }

  return (
    <section className="drawer-section">
      <SettingRow label="时钟样式">
        <Segmented<ClockStyle> value={clockStyle} values={['ink', 'dial', 'flip']} labels={['墨迹', '圆盘', '翻页']} onChange={setClockStyle} />
      </SettingRow>
      <SettingRow label="时间格式">
        <Segmented<TimeFormat> value={timeFormat} values={['24h', '12h']} labels={['24h', '12h']} onChange={setTimeFormat} />
      </SettingRow>
      <SettingRow label="夜间模式">
        <Segmented<ThemeMode>
          value={theme}
          values={['system', 'light', 'moss', 'sakura', 'indigo', 'dark']}
          labels={['跟随', '和纸', '苔庭', '薄樱', '靛蓝', '夜墨']}
          onChange={setTheme}
        />
      </SettingRow>
      <label className="slider-row">
        <span>背景动效</span>
        <input type="range" min="0" max="100" value={backgroundMotion} onChange={(event) => setBackgroundMotion(Number(event.target.value))} />
        <strong>{backgroundMotion}%</strong>
      </label>
      <NumberField
        label="每日目标"
        suffix="分钟"
        min={15}
        max={960}
        value={dailyGoalMinutes}
        onChange={setDailyGoalMinutes}
      />
      <div className="data-actions">
        <button type="button" onClick={exportJson}><DownloadSimple size={17} weight="thin" />导出 JSON</button>
        <button type="button" onClick={() => inputRef.current?.click()}><UploadSimple size={17} weight="thin" />导入 JSON</button>
        <button type="button" className="danger" onClick={clear}><Warning size={17} weight="thin" />清除数据</button>
        <input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={(event) => void importJson(event)} />
      </div>
    </section>
  )
}

function SettingRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      {children}
    </div>
  )
}

function Segmented<T extends string>({
  labels,
  onChange,
  value,
  values,
}: {
  labels: string[]
  onChange: (value: T) => void
  value: T
  values: T[]
}) {
  return (
    <div className="segmented">
      {values.map((item, index) => (
        <button className={value === item ? 'active' : ''} key={item} type="button" onClick={() => onChange(item)}>
          {labels[index]}
        </button>
      ))}
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
