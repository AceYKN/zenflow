import { Check } from '@phosphor-icons/react'
import { scenes } from '@/data'
import { useZenStore } from '@/store'

export function ScenePanel() {
  const currentSceneId = useZenStore((state) => state.currentSceneId)
  const applyScene = useZenStore((state) => state.applyScene)

  return (
    <section className="drawer-section scene-grid">
      <p className="notice">
        场景会切换背景气质和推荐音景；如果声音正在播放，会平滑淡入新的组合。主题配色请在设置中单独选择。
      </p>
      {scenes.map((scene) => (
        <button
          className={currentSceneId === scene.id ? 'scene-card active' : 'scene-card'}
          key={scene.id}
          style={{ '--scene-accent': scene.accent } as React.CSSProperties}
          type="button"
          onClick={() => applyScene(scene.id)}
        >
          <span className="scene-mark" />
          <span>
            <strong>{scene.name}</strong>
            <small>{scene.description}</small>
            <em>{scene.tone}</em>
          </span>
          {currentSceneId === scene.id ? <Check size={18} weight="thin" /> : null}
        </button>
      ))}
    </section>
  )
}
