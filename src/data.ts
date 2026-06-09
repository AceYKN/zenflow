import type { Icon } from '@phosphor-icons/react'
import {
  Bell,
  Campfire,
  CloudRain,
  Coffee,
  Keyboard,
  MusicNotes,
  SpeakerHigh,
  TreeEvergreen,
  WaveSawtooth,
  Waves,
  Wind,
} from '@phosphor-icons/react'

export type ClockStyle = 'ink' | 'dial' | 'flip'
export type TimeFormat = '24h' | '12h'
export type ThemeMode = 'system' | 'light' | 'moss' | 'sakura' | 'indigo' | 'dark'
export type DrawerMode = 'scene' | 'audio' | 'timer' | 'stats' | 'notes' | 'settings' | null
export type BreakIntensity = 'gentle' | 'standard' | 'strong'
export type TimerMode = 'focus' | 'short' | 'long'
export type DaySegment = 'morning' | 'afternoon' | 'evening'

export const trackIds = [
  'rain',
  'forest',
  'stream',
  'ocean',
  'cafe',
  'fireplace',
  'typewriter',
  'white_noise',
  'brown_noise',
  'lofi',
  'wind_chime',
  'temple_bell',
] as const

export type TrackId = (typeof trackIds)[number]

export type TrackMeta = {
  id: TrackId
  name: string
  label: string
  kind: string
  description: string
  defaultVolume: number
  icon: Icon
}

export type TrackMix = Record<TrackId, { enabled: boolean; volume: number }>

export type Preset = {
  id: string
  name: string
  mix: Partial<Record<TrackId, number>>
}

export type SceneId = 'rain-study' | 'morning-temple' | 'sunny-garden' | 'deep-night' | 'sunny-cafe'

export type Scene = Preset & {
  id: SceneId
  description: string
  tone: string
  accent: string
}

export type BreakSettings = {
  enabled: boolean
  minMinutes: number
  maxMinutes: number
  recallSeconds: number
  cueVolume: number
  intensity: BreakIntensity
}

export type TimerSettings = {
  enabled: boolean
  focusMinutes: number
  shortMinutes: number
  longMinutes: number
}

export type TimerState = {
  mode: TimerMode
  running: boolean
  remainingSeconds: number
}

export type DailyStats = {
  date: string
  focusSeconds: number
  breakCount: number
  pomodoroCount: number
  longestFocusSeconds: number
  segments: Record<DaySegment, number>
}

export type TaskItem = {
  id: string
  title: string
  done: boolean
  createdAt: number
}

export const tracks: TrackMeta[] = [
  {
    id: 'rain',
    name: '细雨敲窗',
    label: 'Rain',
    kind: '自然',
    description: '室外连绵细雨，贴近窗纸。',
    defaultVolume: 48,
    icon: CloudRain,
  },
  {
    id: 'forest',
    name: '深山林籁',
    label: 'Forest',
    kind: '自然',
    description: '低密度鸟鸣与远处树声。',
    defaultVolume: 32,
    icon: TreeEvergreen,
  },
  {
    id: 'stream',
    name: '山涧溪流',
    label: 'Stream',
    kind: '自然',
    description: '细小流水声，适合长读。',
    defaultVolume: 34,
    icon: Waves,
  },
  {
    id: 'ocean',
    name: '远海浪声',
    label: 'Ocean',
    kind: '自然',
    description: '深沉缓慢的海浪拍岸。',
    defaultVolume: 36,
    icon: Waves,
  },
  {
    id: 'cafe',
    name: '咖啡馆人声',
    label: 'Cafe',
    kind: '环境',
    description: '低频室内人声，不抢注意力。',
    defaultVolume: 28,
    icon: Coffee,
  },
  {
    id: 'fireplace',
    name: '炉火噼啪',
    label: 'Fire',
    kind: '环境',
    description: '木柴燃烧的细碎裂响。',
    defaultVolume: 34,
    icon: Campfire,
  },
  {
    id: 'typewriter',
    name: '老式打字机',
    label: 'Keys',
    kind: '环境',
    description: '复古机械按键和回车声。',
    defaultVolume: 20,
    icon: Keyboard,
  },
  {
    id: 'white_noise',
    name: '白噪音',
    label: 'White',
    kind: '纯音',
    description: '平坦频谱，用于遮蔽杂声。',
    defaultVolume: 36,
    icon: WaveSawtooth,
  },
  {
    id: 'brown_noise',
    name: '棕噪音',
    label: 'Brown',
    kind: '纯音',
    description: '更低频、更温和的噪声底。',
    defaultVolume: 34,
    icon: SpeakerHigh,
  },
  {
    id: 'lofi',
    name: 'Lo-Fi 琴声',
    label: 'Lo-Fi',
    kind: '音乐',
    description: '慵懒钢琴与轻微黑胶质感。',
    defaultVolume: 22,
    icon: MusicNotes,
  },
  {
    id: 'wind_chime',
    name: '风铃',
    label: 'Chime',
    kind: '日式',
    description: '偶发玻璃风铃，轻而不惊。',
    defaultVolume: 14,
    icon: Wind,
  },
  {
    id: 'temple_bell',
    name: '寺院晨钟',
    label: 'Bell',
    kind: '日式',
    description: '低沉铜钟余韵，间隔很长。',
    defaultVolume: 10,
    icon: Bell,
  },
]

export const createInitialMix = (): TrackMix =>
  Object.fromEntries(
    tracks.map((track) => [
      track.id,
      {
        enabled: false,
        volume: track.defaultVolume,
      },
    ]),
  ) as TrackMix

export const scenes: Scene[] = [
  {
    id: 'rain-study',
    name: '雨夜书斋',
    description: '窗边雨滴、炉火、偶尔一声风铃。',
    tone: '推荐音景 + 暖色背景',
    accent: '#8b6f47',
    mix: { rain: 48, fireplace: 26, wind_chime: 12 },
  },
  {
    id: 'morning-temple',
    name: '山寺晨钟',
    description: '远山晨雾、林声与低沉钟声。',
    tone: '推荐音景 + 清冷背景',
    accent: '#5f7c78',
    mix: { forest: 32, wind_chime: 12, white_noise: 16, temple_bell: 8 },
  },
  {
    id: 'sunny-garden',
    name: '晴日庭院',
    description: '枯山水石庭，溪流与自然低声。',
    tone: '推荐音景 + 明亮背景',
    accent: '#4a7c59',
    mix: { stream: 34, forest: 22, wind_chime: 10 },
  },
  {
    id: 'deep-night',
    name: '深夜专注',
    description: '低亮度背景，白噪与棕噪铺底。',
    tone: '推荐音景 + 低亮背景',
    accent: '#5c5490',
    mix: { white_noise: 42, brown_noise: 28, ocean: 20 },
  },
  {
    id: 'sunny-cafe',
    name: '晴日咖啡',
    description: '暖光漫射、低人声和轻柔 Lo-Fi。',
    tone: '推荐音景 + 暖光背景',
    accent: '#a16c47',
    mix: { cafe: 28, lofi: 18 },
  },
]

export const presets: Preset[] = [
  { id: 'rain-study', name: '雨夜书房', mix: { rain: 48, fireplace: 26, wind_chime: 12 } },
  { id: 'tea-room', name: '山中茶室', mix: { forest: 32, wind_chime: 12, white_noise: 16 } },
  { id: 'sunny-cafe', name: '晴日咖啡', mix: { cafe: 28, lofi: 18 } },
  { id: 'deep-sea', name: '深海专注', mix: { white_noise: 42, brown_noise: 28, ocean: 20 } },
  { id: 'mountain-retreat', name: '深山静修', mix: { stream: 34, temple_bell: 8, forest: 22 } },
]

export const breakPrompts = [
  '把刚才的重点在脑中复述一遍。',
  '闭上眼睛，回想一个刚读到的概念。',
  '不要看资料，试着说出三个关键词。',
  '把刚才学到的内容压缩成一句话。',
  '如果现在要教别人，你会从哪一句开始？',
  '找到一个还模糊的地方，轻轻记住它。',
  '让呼吸慢下来，再把注意力放回手边。',
]

export const defaultBreakSettings: BreakSettings = {
  enabled: false,
  minMinutes: 15,
  maxMinutes: 30,
  recallSeconds: 5,
  cueVolume: 42,
  intensity: 'gentle',
}

export const defaultTimerSettings: TimerSettings = {
  enabled: false,
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
}

export const defaultTimerState: TimerState = {
  mode: 'focus',
  running: false,
  remainingSeconds: defaultTimerSettings.focusMinutes * 60,
}

export const timerModeLabels: Record<TimerMode, string> = {
  focus: '专注',
  short: '短休',
  long: '长休',
}
