import { useCallback, useEffect, useRef } from 'react'
import { tracks, type BreakIntensity, type TrackId, type TrackMix } from '@/data'
import {
  createAmbientVoice,
  pauseVoice,
  playCueTone,
  startVoice,
  stopVoice,
  type AmbientVoice,
} from '@/lib/audio'

export function useAmbientEngine(mix: TrackMix, soundPlaying: boolean) {
  const contextRef = useRef<AudioContext | null>(null)
  const mixRef = useRef(mix)
  const soundPlayingRef = useRef(soundPlaying)
  const voicesRef = useRef<Map<TrackId, AmbientVoice>>(new Map())

  useEffect(() => {
    mixRef.current = mix
    soundPlayingRef.current = soundPlaying
  }, [mix, soundPlaying])

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
      const setting = mix[track.id]
      let voice = voicesRef.current.get(track.id)

      if (!voice && setting.enabled) {
        voice = createAmbientVoice(context, track.id)
        voicesRef.current.set(track.id, voice)
      }

      if (!voice) return

      const shouldPlay = soundPlaying && setting.enabled
      const targetGain = shouldPlay ? (setting.volume / 100) * voice.gainScale : 0

      const currentGain = voice.gain.gain.value
      voice.gain.gain.cancelScheduledValues(context.currentTime)
      voice.gain.gain.setValueAtTime(currentGain, context.currentTime)
      voice.gain.gain.linearRampToValueAtTime(targetGain, context.currentTime + (targetGain > 0 ? 1.2 : 0.8))

      if (shouldPlay) {
        startVoice(voice)
      } else {
        pauseVoice(voice)
      }
    })
  }, [mix, soundPlaying])

  useEffect(() => {
    const voices = voicesRef.current

    const resume = () => {
      if (document.visibilityState === 'visible') {
        void contextRef.current?.resume()
        if (soundPlayingRef.current) {
          voices.forEach((voice) => {
            const setting = mixRef.current[voice.trackId]
            if (setting?.enabled) startVoice(voice)
          })
        }
      }
    }
    document.addEventListener('visibilitychange', resume)

    return () => {
      document.removeEventListener('visibilitychange', resume)
      voices.forEach((voice) => stopVoice(voice))
      voices.clear()
      void contextRef.current?.close()
    }
  }, [])

  return { ensureContext, playCue }
}
