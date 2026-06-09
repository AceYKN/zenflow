import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  createInitialMix,
  defaultBreakSettings,
  defaultTimerSettings,
  defaultTimerState,
  scenes,
  tracks,
  type BreakSettings,
  type ClockStyle,
  type DailyStats,
  type Preset,
  type SceneId,
  type TaskItem,
  type ThemeMode,
  type TimeFormat,
  type TimerMode,
  type TimerSettings,
  type TimerState,
  type TrackId,
  type TrackMix,
} from '@/data'
import { createDailyStats, getDateKey, getDaySegment, getTimerDuration } from '@/utils/format'

export type AudioStatus = 'idle' | 'ready' | 'blocked'

type ZenPersistedState = {
  clockStyle: ClockStyle
  timeFormat: TimeFormat
  theme: ThemeMode
  backgroundMotion: number
  currentSceneId: SceneId
  mix: TrackMix
  customPresets: Preset[]
  breakSettings: BreakSettings
  timerSettings: TimerSettings
  timer: TimerState
  focusActive: boolean
  currentFocusStreak: number
  stats: Record<string, DailyStats>
  dailyGoalMinutes: number
  note: string
  tasks: TaskItem[]
}

type ZenRuntimeState = {
  audioStatus: AudioStatus
  soundPlaying: boolean
}

type ZenActions = {
  setClockStyle: (clockStyle: ClockStyle) => void
  setTimeFormat: (timeFormat: TimeFormat) => void
  setTheme: (theme: ThemeMode) => void
  setBackgroundMotion: (backgroundMotion: number) => void
  applyScene: (sceneId: SceneId) => void
  applyPreset: (preset: Preset) => void
  saveCustomPreset: (name: string) => boolean
  deleteCustomPreset: (id: string) => void
  setTrackEnabled: (trackId: TrackId, enabled: boolean) => void
  setTrackVolume: (trackId: TrackId, volume: number) => void
  setAudioStatus: (audioStatus: AudioStatus) => void
  setSoundPlaying: (soundPlaying: boolean) => void
  setBreakSettings: (settings: BreakSettings | ((current: BreakSettings) => BreakSettings)) => void
  setTimerSettings: (settings: TimerSettings | ((current: TimerSettings) => TimerSettings)) => void
  setTimerMode: (mode: TimerMode) => void
  setTimerRunning: (running: boolean) => void
  setTimerRemaining: (seconds: number) => void
  resetTimer: () => void
  completeTimerMode: () => void
  setFocusActive: (focusActive: boolean) => void
  addFocusSeconds: (seconds: number) => void
  recordBreakCue: () => void
  setDailyGoalMinutes: (dailyGoalMinutes: number) => void
  setNote: (note: string) => void
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  clearCompletedTasks: () => void
  importSnapshot: (snapshot: Partial<ZenPersistedState>) => void
  clearAllData: () => void
}

export type ZenState = ZenPersistedState & ZenRuntimeState & ZenActions

const initialStats = () => ({
  [getDateKey(new Date())]: createDailyStats(),
})

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

function ensureToday(stats: Record<string, DailyStats>) {
  const today = getDateKey(new Date())
  return {
    today,
    stats: stats[today] ? stats : { ...stats, [today]: createDailyStats(today) },
  }
}

function mixFromPreset(preset: Preset, current: TrackMix) {
  const next = createInitialMix()
  tracks.forEach((track) => {
    const volume = preset.mix[track.id]
    next[track.id] = {
      enabled: typeof volume === 'number',
      volume: typeof volume === 'number' ? volume : current[track.id].volume,
    }
  })
  return next
}

const createDefaultState = (): ZenPersistedState & ZenRuntimeState => ({
  clockStyle: 'ink',
  timeFormat: '24h',
  theme: 'system',
  backgroundMotion: 60,
  currentSceneId: 'sunny-garden',
  mix: createInitialMix(),
  customPresets: [],
  breakSettings: defaultBreakSettings,
  timerSettings: defaultTimerSettings,
  timer: defaultTimerState,
  focusActive: false,
  currentFocusStreak: 0,
  stats: initialStats(),
  dailyGoalMinutes: 240,
  note: '',
  tasks: [],
  audioStatus: 'idle',
  soundPlaying: false,
})

export const useZenStore = create<ZenState>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),
      setClockStyle: (clockStyle) => set({ clockStyle }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setTheme: (theme) => set({ theme }),
      setBackgroundMotion: (backgroundMotion) => set({ backgroundMotion: clampPercent(backgroundMotion) }),
      applyScene: (sceneId) =>
        set((state) => {
          const scene = scenes.find((item) => item.id === sceneId) ?? scenes[0]
          return {
            currentSceneId: scene.id,
            mix: mixFromPreset(scene, state.mix),
            theme: scene.forceDark ? 'dark' : state.theme,
          }
        }),
      applyPreset: (preset) => set((state) => ({ mix: mixFromPreset(preset, state.mix) })),
      saveCustomPreset: (name) => {
        const clean = name.trim()
        if (!clean || get().customPresets.length >= 5) return false
        const mix = get().mix
        const activeMix = Object.fromEntries(
          tracks.filter((track) => mix[track.id].enabled).map((track) => [track.id, mix[track.id].volume]),
        ) as Partial<Record<TrackId, number>>
        set((state) => ({
          customPresets: [
            ...state.customPresets,
            {
              id: crypto.randomUUID(),
              name: clean,
              mix: activeMix,
            },
          ],
        }))
        return true
      },
      deleteCustomPreset: (id) =>
        set((state) => ({ customPresets: state.customPresets.filter((preset) => preset.id !== id) })),
      setTrackEnabled: (trackId, enabled) =>
        set((state) => ({
          mix: {
            ...state.mix,
            [trackId]: { ...state.mix[trackId], enabled },
          },
        })),
      setTrackVolume: (trackId, volume) =>
        set((state) => ({
          mix: {
            ...state.mix,
            [trackId]: { ...state.mix[trackId], volume: clampPercent(volume) },
          },
        })),
      setAudioStatus: (audioStatus) => set({ audioStatus }),
      setSoundPlaying: (soundPlaying) => set({ soundPlaying }),
      setBreakSettings: (updater) =>
        set((state) => ({
          breakSettings: typeof updater === 'function' ? updater(state.breakSettings) : updater,
        })),
      setTimerSettings: (updater) =>
        set((state) => {
          const nextSettings = typeof updater === 'function' ? updater(state.timerSettings) : updater
          const duration = getTimerDuration(state.timer.mode, nextSettings)
          return {
            timerSettings: nextSettings,
            timer: state.timer.running ? state.timer : { ...state.timer, remainingSeconds: duration },
          }
        }),
      setTimerMode: (mode) =>
        set((state) => ({
          timer: {
            mode,
            running: false,
            remainingSeconds: getTimerDuration(mode, state.timerSettings),
          },
        })),
      setTimerRunning: (running) => set((state) => ({ timer: { ...state.timer, running } })),
      setTimerRemaining: (seconds) =>
        set((state) => ({ timer: { ...state.timer, remainingSeconds: Math.max(0, seconds) } })),
      resetTimer: () =>
        set((state) => ({
          timer: {
            ...state.timer,
            running: false,
            remainingSeconds: getTimerDuration(state.timer.mode, state.timerSettings),
          },
        })),
      completeTimerMode: () =>
        set((state) => {
          const { today, stats } = ensureToday(state.stats)
          const current = stats[today]
          const nextStats = {
            ...stats,
            [today]: {
              ...current,
              pomodoroCount: state.timer.mode === 'focus' ? current.pomodoroCount + 1 : current.pomodoroCount,
            },
          }
          const nextMode: TimerMode = state.timer.mode === 'focus' ? 'short' : 'focus'
          return {
            stats: nextStats,
            timer: {
              mode: nextMode,
              running: false,
              remainingSeconds: getTimerDuration(nextMode, state.timerSettings),
            },
          }
        }),
      setFocusActive: (focusActive) =>
        set((state) => ({
          focusActive,
          currentFocusStreak: focusActive ? state.currentFocusStreak : 0,
        })),
      addFocusSeconds: (seconds) =>
        set((state) => {
          const delta = Math.max(0, seconds)
          const { today, stats } = ensureToday(state.stats)
          const segment = getDaySegment(new Date())
          const current = stats[today]
          const streak = state.currentFocusStreak + delta
          return {
            currentFocusStreak: streak,
            stats: {
              ...stats,
              [today]: {
                ...current,
                focusSeconds: current.focusSeconds + delta,
                longestFocusSeconds: Math.max(current.longestFocusSeconds, streak),
                segments: {
                  ...current.segments,
                  [segment]: current.segments[segment] + delta,
                },
              },
            },
          }
        }),
      recordBreakCue: () =>
        set((state) => {
          const { today, stats } = ensureToday(state.stats)
          const current = stats[today]
          return {
            stats: {
              ...stats,
              [today]: {
                ...current,
                breakCount: current.breakCount + 1,
              },
            },
          }
        }),
      setDailyGoalMinutes: (dailyGoalMinutes) => set({ dailyGoalMinutes: Math.max(15, dailyGoalMinutes) }),
      setNote: (note) => set({ note }),
      addTask: (title) => {
        const clean = title.trim()
        if (!clean) return
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title: clean,
              done: false,
              createdAt: Date.now(),
            },
            ...state.tasks,
          ],
        }))
      },
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
      clearCompletedTasks: () => set((state) => ({ tasks: state.tasks.filter((task) => !task.done) })),
      importSnapshot: (snapshot) =>
        set((state) => ({
          ...state,
          ...snapshot,
          audioStatus: state.audioStatus,
          soundPlaying: state.soundPlaying,
        })),
      clearAllData: () => set(createDefaultState()),
    }),
    {
      name: 'zenflow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clockStyle: state.clockStyle,
        timeFormat: state.timeFormat,
        theme: state.theme,
        backgroundMotion: state.backgroundMotion,
        currentSceneId: state.currentSceneId,
        mix: state.mix,
        customPresets: state.customPresets,
        breakSettings: state.breakSettings,
        timerSettings: state.timerSettings,
        timer: state.timer,
        focusActive: state.focusActive,
        currentFocusStreak: state.currentFocusStreak,
        stats: state.stats,
        dailyGoalMinutes: state.dailyGoalMinutes,
        note: state.note,
        tasks: state.tasks,
      }),
    },
  ),
)
