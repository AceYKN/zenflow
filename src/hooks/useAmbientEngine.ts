import { useCallback, useEffect, useRef } from 'react'
import { tracks, type BreakIntensity, type TrackId, type TrackMix } from '@/data'
import { createAmbientVoice, playCueTone, type AmbientVoice } from '@/lib/audio'

export function useAmbientEngine(mix: TrackMix, soundPlaying: boolean) {
  const contextRef = useRef<AudioContext | null>(null)
  const voicesRef = useRef<Map<TrackId, AmbientVoice>>(new Map())

  const ensureContext = useCallback(async () => {
    try {
      const fallback = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      const AudioContextConstructor = window.AudioContext ?? fallback
      if (!AudioContextConstructor) return false

      if (!contextRef.current) {
        contextRef.current = new AudioContextConstructor()
      }

      await contextRef.current.resume()
      return contextRef.current.state === 'running'
    } catch {
      return false
    }
  }, [])

  const playCue = useCallback((intensity: BreakIntensity, volume: number) => {
    const context = contextRef.current
    if (!context) return
    playCueTone(context, intensity, volume)
  }, [])

  useEffect(() => {
    const context = contextRef.current
    if (!context) return

    tracks.forEach((track) => {
      let voice = voicesRef.current.get(track.id)
      if (!voice) {
        voice = createAmbientVoice(context, track.id)
        voicesRef.current.set(track.id, voice)
      }

      const setting = mix[track.id]
      const target = soundPlaying && setting.enabled ? (setting.volume / 100) * 0.34 : 0
      const currentGain = voice.gain.gain.value
      voice.gain.gain.cancelScheduledValues(context.currentTime)
      voice.gain.gain.setValueAtTime(currentGain, context.currentTime)
      voice.gain.gain.linearRampToValueAtTime(target, context.currentTime + (target > 0 ? 1.5 : 1))
    })
  }, [mix, soundPlaying])

  useEffect(() => {
    const voices = voicesRef.current
    const resume = () => {
      if (document.visibilityState === 'visible') {
        void contextRef.current?.resume()
      }
    }
    document.addEventListener('visibilitychange', resume)

    return () => {
      document.removeEventListener('visibilitychange', resume)
      voices.forEach((voice) => voice.source.stop())
      voices.clear()
      void contextRef.current?.close()
    }
  }, [])

  return { ensureContext, playCue }
}
