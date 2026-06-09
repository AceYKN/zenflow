import { Pause, Play, Plus, SpeakerHigh, SpeakerSlash, Trash } from '@phosphor-icons/react'
import { presets, tracks } from '@/data'
import { useZenStore } from '@/store'

export function AudioPanel({
  onStartAudio,
  onToggleAudio,
}: {
  onStartAudio: () => Promise<void>
  onToggleAudio: () => Promise<void>
}) {
  const audioStatus = useZenStore((state) => state.audioStatus)
  const customPresets = useZenStore((state) => state.customPresets)
  const mix = useZenStore((state) => state.mix)
  const soundPlaying = useZenStore((state) => state.soundPlaying)
  const applyPreset = useZenStore((state) => state.applyPreset)
  const deleteCustomPreset = useZenStore((state) => state.deleteCustomPreset)
  const saveCustomPreset = useZenStore((state) => state.saveCustomPreset)
  const setTrackEnabled = useZenStore((state) => state.setTrackEnabled)
  const setTrackVolume = useZenStore((state) => state.setTrackVolume)

  const savePreset = () => {
    const name = window.prompt('给当前音景取一个名字')
    if (name) saveCustomPreset(name)
  }

  return (
    <section className="drawer-section">
      <button className={soundPlaying ? 'master-button playing' : 'master-button'} type="button" onClick={() => void onToggleAudio()}>
        {soundPlaying ? <Pause size={20} weight="thin" /> : <Play size={20} weight="thin" />}
        {soundPlaying ? '暂停声音' : '开始声音'}
      </button>
      <p className="notice">
        {audioStatus === 'blocked'
          ? '浏览器阻止了音频启动，请点击“开始声音”。'
          : '首次点击后才初始化 Web Audio。环境音与专注计时互相独立。'}
      </p>

      <div className="preset-row">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => applyPreset(preset)}>
            {preset.name}
          </button>
        ))}
        <button type="button" onClick={savePreset} disabled={customPresets.length >= 5}>
          <Plus size={15} weight="thin" />
          保存
        </button>
      </div>

      {customPresets.length > 0 ? (
        <div className="custom-presets">
          {customPresets.map((preset) => (
            <span key={preset.id}>
              <button type="button" onClick={() => applyPreset(preset)}>{preset.name}</button>
              <button type="button" onClick={() => deleteCustomPreset(preset.id)} aria-label={`删除${preset.name}`}>
                <Trash size={14} weight="thin" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="track-grid">
        {tracks.map((track) => {
          const Icon = track.icon
          const setting = mix[track.id]

          return (
            <article className={setting.enabled ? 'track-card active' : 'track-card'} key={track.id}>
              <button
                type="button"
                className="track-power"
                onClick={() => {
                  setTrackEnabled(track.id, !setting.enabled)
                  if (!setting.enabled && !soundPlaying) void onStartAudio()
                }}
                aria-label={`${setting.enabled ? '关闭' : '开启'}${track.name}`}
              >
                {setting.enabled ? <SpeakerHigh size={18} weight="thin" /> : <SpeakerSlash size={18} weight="thin" />}
              </button>
              <Icon size={23} weight="thin" />
              <div>
                <strong>{track.name}</strong>
                <span>{track.kind} · {track.description}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={setting.volume}
                aria-label={`${track.name}音量`}
                onChange={(event) => setTrackVolume(track.id, Number(event.target.value))}
                onWheel={(event) => {
                  event.currentTarget.blur()
                  setTrackVolume(track.id, setting.volume + (event.deltaY > 0 ? -2 : 2))
                }}
              />
              <small>{setting.volume}%</small>
            </article>
          )
        })}
      </div>
    </section>
  )
}
