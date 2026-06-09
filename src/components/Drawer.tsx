import { X } from '@phosphor-icons/react'
import type { DrawerMode } from '@/data'

export function Drawer({
  children,
  drawer,
  onClose,
}: {
  children: React.ReactNode
  drawer: NonNullable<DrawerMode>
  onClose: () => void
}) {
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={drawerTitle(drawer)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-heading">
          <div>
            <p>{drawerEyebrow(drawer)}</p>
            <h2>{drawerTitle(drawer)}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭">
            <X size={20} weight="thin" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}

function drawerTitle(drawer: NonNullable<DrawerMode>) {
  if (drawer === 'scene') return '沉浸之境'
  if (drawer === 'audio') return '环境音效'
  if (drawer === 'break') return '学习断点'
  if (drawer === 'timer') return '番茄计时'
  if (drawer === 'stats') return '学习统计'
  if (drawer === 'notes') return '笔记任务'
  return '设置'
}

function drawerEyebrow(drawer: NonNullable<DrawerMode>) {
  if (drawer === 'scene') return 'ZenKyokai'
  if (drawer === 'audio') return 'ZenAudio'
  if (drawer === 'break') return 'ZenBreak'
  if (drawer === 'timer') return 'ZenTimer'
  if (drawer === 'stats') return 'ZenStats'
  if (drawer === 'notes') return 'ZenNote'
  return 'Settings'
}
