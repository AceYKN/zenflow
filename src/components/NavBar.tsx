import {
  Bell,
  ChartLineUp,
  GearSix,
  Leaf,
  Moon,
  MusicNotes,
  Notebook,
  Palette,
  Timer,
  Sun,
} from '@phosphor-icons/react'
import type { DrawerMode, ThemeMode } from '@/data'

export function NavBar({
  activeDrawer,
  breakEnabled,
  focusActive,
  soundPlaying,
  theme,
  onOpen,
  onThemeToggle,
}: {
  activeDrawer: DrawerMode
  breakEnabled: boolean
  focusActive: boolean
  soundPlaying: boolean
  theme: ThemeMode
  onOpen: (drawer: DrawerMode) => void
  onThemeToggle: () => void
}) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onOpen('settings')} aria-label="打开设置">
        <Leaf size={22} weight="thin" />
        <span>ZenFlow · 静流</span>
      </button>
      <nav className="top-actions" aria-label="主要功能">
        <NavButton active={activeDrawer === 'scene'} label="境" onClick={() => onOpen('scene')}>
          <Palette size={19} weight="thin" />
        </NavButton>
        <NavButton active={activeDrawer === 'audio' || soundPlaying} label="音景" onClick={() => onOpen('audio')}>
          <MusicNotes size={19} weight="thin" />
        </NavButton>
        <NavButton active={activeDrawer === 'break' || breakEnabled} label="断点" onClick={() => onOpen('break')}>
          <Bell size={19} weight="thin" />
        </NavButton>
        <NavButton active={activeDrawer === 'timer' || focusActive} label="计时" onClick={() => onOpen('timer')}>
          <Timer size={19} weight="thin" />
        </NavButton>
        <NavButton active={activeDrawer === 'stats'} label="统计" onClick={() => onOpen('stats')}>
          <ChartLineUp size={19} weight="thin" />
        </NavButton>
        <NavButton active={activeDrawer === 'notes'} label="笔记" onClick={() => onOpen('notes')}>
          <Notebook size={19} weight="thin" />
        </NavButton>
        <button type="button" onClick={onThemeToggle} aria-label="切换夜间模式">
          {theme === 'dark' ? <Sun size={19} weight="thin" /> : <Moon size={19} weight="thin" />}
        </button>
        <button type="button" onClick={() => onOpen('settings')} aria-label="设置">
          <GearSix size={19} weight="thin" />
        </button>
      </nav>
    </header>
  )
}

function NavButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button className={active ? 'active' : ''} type="button" onClick={onClick} aria-label={label} title={label}>
      {children}
      <span>{label}</span>
    </button>
  )
}
