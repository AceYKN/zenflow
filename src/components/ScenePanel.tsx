import { Check } from '@phosphor-icons/react'
import { scenes } from '@/data'
import { useZenStore } from '@/store'

export function ScenePanel() {
  const currentSceneId = useZenStore((state) => state.currentSceneId)
  const applyScene = useZenStore((state) => state.applyScene)

  return (
    <section className="drawer-section scene-grid">
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
