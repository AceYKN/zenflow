import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Pause, Play, Target } from '@phosphor-icons/react'
import './App.css'
import { breakPrompts, scenes, type DrawerMode } from '@/data'
import { useAmbientEngine } from '@/hooks/useAmbientEngine'
import { useBreakScheduler } from '@/hooks/useBreakScheduler'
import { useClock } from '@/hooks/useClock'
import { useFocusTicker } from '@/hooks/useFocusTicker'
import { useInputActivity } from '@/hooks/useInputActivity'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer'
import { useZenStore } from '@/store'
import { createDailyStats, formatChineseDate, formatChineseDuration, getDateKey } from '@/utils/format'
import { getFlowIndex } from '@/utils/stats'
import { AudioPanel } from '@/components/AudioPanel'
import { BackgroundCanvas } from '@/components/BackgroundCanvas'
import { BottomStatus } from '@/components/BottomStatus'
import { BreakPanel } from '@/components/BreakPanel'
import { Drawer } from '@/components/Drawer'
import { NavBar } from '@/components/NavBar'
import { NotesPanel } from '@/components/NotesPanel'
import { ScenePanel } from '@/components/ScenePanel'
import { SettingsPanel } from '@/components/SettingsPanel'
import { StatsPanel } from '@/components/StatsPanel'
import { TimerPanel } from '@/components/TimerPanel'
import { ZenClock } from '@/components/ZenClock'

function App() {
  const now = useClock()
  const inputFocused = useInputActivity()
  const noticeTimerRef = useRef<number | null>(null)
  const [drawer, setDrawer] = useState<DrawerMode>(null)
  const [clockHover, setClockHover] = useState(false)
  const [breakNotice, setBreakNotice] = useState('')

  const audioStatus = useZenStore((state) => state.audioStatus)
  const breakSettings = useZenStore((state) => state.breakSettings)
  const clockStyle = useZenStore((state) => state.clockStyle)
  const currentSceneId = useZenStore((state) => state.currentSceneId)
  const dailyGoalMinutes = useZenStore((state) => state.dailyGoalMinutes)
  const focusActive = useZenStore((state) => state.focusActive)
  const mix = useZenStore((state) => state.mix)
  const recordBreakCue = useZenStore((state) => state.recordBreakCue)
  const setAudioStatus = useZenStore((state) => state.setAudioStatus)
  const setClockStyle = useZenStore((state) => state.setClockStyle)
  const setFocusActive = useZenStore((state) => state.setFocusActive)
  const setSoundPlaying = useZenStore((state) => state.setSoundPlaying)
  const setTheme = useZenStore((state) => state.setTheme)
  const soundPlaying = useZenStore((state) => state.soundPlaying)
  const stats = useZenStore((state) => state.stats)
  const theme = useZenStore((state) => state.theme)
  const timeFormat = useZenStore((state) => state.timeFormat)
  const applyPreset = useZenStore((state) => state.applyPreset)

  const currentScene = scenes.find((scene) => scene.id === currentSceneId) ?? scenes[0]
  const activeTracks = useMemo(() => Object.entries(mix).filter(([, setting]) => setting.enabled), [mix])
  const today = stats[getDateKey(new Date())] ?? createDailyStats()
  const flowIndex = getFlowIndex(today, dailyGoalMinutes * 60)
  const { ensureContext, playCue } = useAmbientEngine(mix, soundPlaying)

  useFocusTicker()
  usePomodoroTimer()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const beginAudio = useCallback(async () => {
    if (activeTracks.length === 0) {
      applyPreset(currentScene)
    }

    const ready = await ensureContext()
    if (!ready) {
      setAudioStatus('blocked')
      setSoundPlaying(false)
      return
    }
    setAudioStatus('ready')
    setSoundPlaying(true)
  }, [activeTracks.length, applyPreset, currentScene, ensureContext, setAudioStatus, setSoundPlaying])

  const toggleAudio = useCallback(async () => {
    if (soundPlaying) {
      setSoundPlaying(false)
      return
    }
    await beginAudio()
  }, [beginAudio, setSoundPlaying, soundPlaying])

  const toggleFocus = useCallback(async () => {
    if (focusActive) {
      setFocusActive(false)
      return
    }

    if (breakSettings.enabled && breakSettings.cueVolume > 0) {
      const ready = await ensureContext()
      setAudioStatus(ready ? 'ready' : 'blocked')
    }
    setFocusActive(true)
  }, [breakSettings.cueVolume, breakSettings.enabled, ensureContext, focusActive, setAudioStatus, setFocusActive])

  const triggerBreak = useCallback(() => {
    if (!focusActive) return
    const prompt = breakPrompts[Math.floor(Math.random() * breakPrompts.length)]
    recordBreakCue()
    playCue(breakSettings.intensity, breakSettings.cueVolume)
    setBreakNotice(prompt)

    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setBreakNotice(''), breakSettings.recallSeconds * 1000)
  }, [
    breakSettings.cueVolume,
    breakSettings.intensity,
    breakSettings.recallSeconds,
    focusActive,
    playCue,
    recordBreakCue,
  ])

  useBreakScheduler({ inputFocused, onCue: triggerBreak })

  const shortcutActions = useMemo(
    () => ({
      closeDrawer: () => setDrawer(null),
      openNotes: () => setDrawer('notes'),
      openSettings: () => setDrawer('settings'),
      openStats: () => setDrawer('stats'),
      setClockStyle,
      toggleAudio: () => void toggleAudio(),
      toggleFocus: () => void toggleFocus(),
      toggleTimer: () => setDrawer('timer'),
    }),
    [setClockStyle, toggleAudio, toggleFocus],
  )
  useKeyboardShortcuts(shortcutActions)

  const activeTrackText =
    activeTracks.length > 0
      ? activeTracks
          .slice(0, 3)
          .map(([trackId]) => mixLabel(trackId))
          .join(' · ')
      : currentScene.name

  return (
    <main className={`app-shell scene-${currentScene.id}`} style={{ '--scene-accent': currentScene.accent } as CSSProperties}>
      <BackgroundCanvas />
      <div className="image-bg" aria-hidden="true" />
      <NavBar
        activeDrawer={drawer}
        breakEnabled={breakSettings.enabled}
        focusActive={focusActive}
        soundPlaying={soundPlaying}
        theme={theme}
        onOpen={setDrawer}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      <section className="clock-hero" aria-label="ZenFlow 工作台">
        <p className="date-line">{formatChineseDate(now)}</p>
        <div onMouseEnter={() => setClockHover(true)} onMouseLeave={() => setClockHover(false)}>
          <ZenClock
            now={now}
            showSeconds={clockHover}
            style={clockStyle}
            timeFormat={timeFormat}
            onClick={() => setDrawer('settings')}
          />
        </div>
        <p className="tagline">侘寂之间，心流自现</p>
        <div className="hero-actions">
          <button className={focusActive ? 'focus-button active' : 'focus-button'} type="button" onClick={() => void toggleFocus()}>
            <Target size={19} weight="thin" />
            {focusActive ? '暂停专注' : '开始专注'}
          </button>
          <button className={soundPlaying ? 'sound-button active' : 'sound-button'} type="button" onClick={() => void toggleAudio()}>
            {soundPlaying ? <Pause size={19} weight="thin" /> : <Play size={19} weight="thin" />}
            {soundPlaying ? '暂停声音' : '开始声音'}
          </button>
        </div>
        <div className="home-metrics">
          <span>{focusActive ? '专注中' : '专注未开始'}</span>
          <strong>{formatChineseDuration(today.focusSeconds)}</strong>
          <span>{audioStatus === 'blocked' ? '点击以开始声音' : soundPlaying ? activeTrackText : '声音未启动'}</span>
          <span>心流 {flowIndex}</span>
        </div>
      </section>

      <section className="tool-dock" aria-label="功能入口">
        <DockButton active={drawer === 'scene'} label="境" value={currentScene.name} onClick={() => setDrawer('scene')} />
        <DockButton active={drawer === 'audio'} label="音景" value={soundPlaying ? activeTrackText : '未播放'} onClick={() => setDrawer('audio')} />
        <DockButton active={drawer === 'timer'} label="计时" value={focusActive ? '专注中' : '可选'} onClick={() => setDrawer('timer')} />
        <DockButton active={drawer === 'stats'} label="今日" value={formatChineseDuration(today.focusSeconds)} onClick={() => setDrawer('stats')} />
      </section>

      <button className={breakSettings.enabled ? 'break-pill active' : 'break-pill'} type="button" onClick={() => setDrawer('break')}>
        <Bell size={17} weight="thin" />
        ZenBreak {breakSettings.enabled ? `${breakSettings.minMinutes}-${breakSettings.maxMinutes} 分钟` : '未启用'}
      </button>

      {drawer ? (
        <Drawer drawer={drawer} onClose={() => setDrawer(null)}>
          {drawer === 'scene' ? <ScenePanel /> : null}
          {drawer === 'audio' ? <AudioPanel onStartAudio={beginAudio} onToggleAudio={toggleAudio} /> : null}
          {drawer === 'break' ? <BreakPanel onTestBreak={triggerBreak} /> : null}
          {drawer === 'timer' ? <TimerPanel /> : null}
          {drawer === 'stats' ? <StatsPanel /> : null}
          {drawer === 'notes' ? <NotesPanel /> : null}
          {drawer === 'settings' ? <SettingsPanel /> : null}
        </Drawer>
      ) : null}

      {breakNotice ? (
        <div className={`break-toast ${breakSettings.intensity}`} role="status" aria-live="polite">
          <Bell size={21} weight="thin" />
          <div>
            <strong>提示音已响</strong>
            <p>{breakNotice}</p>
            <span>无需操作，给自己 {breakSettings.recallSeconds} 秒。</span>
          </div>
        </div>
      ) : null}

      <BottomStatus />
    </main>
  )
}

function DockButton({
  active,
  label,
  onClick,
  value,
}: {
  active: boolean
  label: string
  onClick: () => void
  value: string
}) {
  return (
    <button className={active ? 'dock-card active' : 'dock-card'} type="button" onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  )
}

function mixLabel(trackId: string) {
  const labels: Record<string, string> = {
    brown_noise: '棕噪音',
    cafe: '咖啡馆',
    fireplace: '炉火',
    forest: '林籁',
    lofi: 'Lo-Fi',
    ocean: '海浪',
    rain: '细雨',
    stream: '溪流',
    temple_bell: '晨钟',
    typewriter: '打字机',
    white_noise: '白噪音',
    wind_chime: '风铃',
  }
  return labels[trackId] ?? trackId
}

export default App
