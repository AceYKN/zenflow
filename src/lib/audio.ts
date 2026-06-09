import type { BreakIntensity, TrackId } from '@/data'

export type AmbientVoice = {
  audioEl: HTMLAudioElement | null
  assetName: string
  gain: GainNode
  gainScale: number
  elGain: GainNode | null
  source: AudioScheduledSourceNode | null
  trackId: TrackId
}

type AudioAsset = {
  file: string
  mime: string
  name: string
}

const AUDIO_ASSETS: Partial<Record<TrackId, AudioAsset>> = {
  cafe: { file: 'cafe.mp3', mime: 'audio/mpeg', name: 'Restaurant crowd talking ambience' },
  fireplace: { file: 'fireplace.mp3', mime: 'audio/mpeg', name: 'Campfire crackles' },
  forest: { file: 'forest.mp3', mime: 'audio/mpeg', name: 'Morning birds' },
  lofi: { file: 'lofi.mp3', mime: 'audio/mpeg', name: 'Relax Beat' },
  ocean: { file: 'ocean.mp3', mime: 'audio/mpeg', name: 'Sea waves with birds loop' },
  rain: { file: 'rain.mp3', mime: 'audio/mpeg', name: 'Light rain loop' },
  stream: { file: 'stream.mp3', mime: 'audio/mpeg', name: 'Water flowing ambience loop' },
  temple_bell: { file: 'temple_bell.mp3', mime: 'audio/mpeg', name: 'Church bell calling' },
  typewriter: { file: 'typewriter.mp3', mime: 'audio/mpeg', name: 'Old typewriter typing' },
  wind_chime: {
    file: 'wind_chime.ogg',
    mime: 'audio/ogg; codecs=vorbis',
    name: 'Wind chime in slight breeze',
  },
}

const TRACK_GAIN_SCALE: Record<TrackId, number> = {
  brown_noise: 0.45,
  cafe: 0.28,
  fireplace: 0.38,
  forest: 0.26,
  lofi: 0.22,
  ocean: 0.36,
  rain: 0.42,
  stream: 0.34,
  temple_bell: 0.18,
  typewriter: 0.24,
  white_noise: 0.34,
  wind_chime: 0.2,
}

function filteredNoise(context: AudioContext, trackId: TrackId) {
  const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0

  for (let index = 0; index < data.length; index += 1) {
    const raw = Math.random() * 2 - 1
    if (trackId === 'brown_noise') {
      last = (last + 0.02 * raw) / 1.02
      data[index] = last * 3.5
    } else if (trackId === 'ocean' || trackId === 'stream' || trackId === 'forest') {
      last += (raw - last) * (trackId === 'stream' ? 0.08 : 0.035)
      data[index] = last * 0.72
    } else if (trackId === 'fireplace' || trackId === 'typewriter') {
      data[index] = Math.random() > 0.988 ? raw * 0.72 : raw * 0.025
    } else {
      data[index] = raw * 0.42
    }
  }

  return buffer
}

function connectSynthSource(context: AudioContext, trackId: TrackId, gain: GainNode) {
  if (trackId === 'lofi') {
    const merger = context.createGain()
    const voices = [220, 277.18, 329.63].map((frequency, index) => {
      const oscillator = context.createOscillator()
      const voiceGain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      voiceGain.gain.value = index === 0 ? 0.18 : 0.08
      oscillator.connect(voiceGain).connect(merger)
      oscillator.start()
      return oscillator
    })
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 720
    merger.connect(filter).connect(gain)
    return voices[0]
  }

  if (trackId === 'temple_bell' || trackId === 'wind_chime') {
    const oscillator = context.createOscillator()
    const filter = context.createBiquadFilter()
    oscillator.type = trackId === 'temple_bell' ? 'triangle' : 'sine'
    oscillator.frequency.value = trackId === 'temple_bell' ? 110 : 740
    filter.type = 'lowpass'
    filter.frequency.value = trackId === 'temple_bell' ? 420 : 1800
    oscillator.connect(filter).connect(gain)
    oscillator.start()
    return oscillator
  }

  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  source.buffer = filteredNoise(context, trackId)
  source.loop = true

  if (trackId === 'white_noise' || trackId === 'rain') {
    filter.type = 'highpass'
    filter.frequency.value = trackId === 'rain' ? 3200 : 200
  } else {
    filter.type = 'lowpass'
    filter.frequency.value =
      trackId === 'stream'
        ? 1600
        : trackId === 'ocean'
          ? 520
          : trackId === 'forest'
            ? 1200
            : trackId === 'brown_noise'
              ? 720
              : 1900
  }

  source.connect(filter).connect(gain)
  source.start()
  return source
}

function getAudioUrl(file: string): string {
  const base = import.meta.env.BASE_URL ?? '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}audio/${file}`
}

function connectRealAudioSource(
  context: AudioContext,
  asset: AudioAsset,
  gain: GainNode,
): { audioEl: HTMLAudioElement; elGain: GainNode } {
  const audioEl = new Audio()

  if (asset.mime && audioEl.canPlayType(asset.mime) === '') {
    throw new Error(`Unsupported audio format: ${asset.file}`)
  }

  audioEl.src = getAudioUrl(asset.file)
  audioEl.loop = true
  audioEl.preload = 'none'
  audioEl.crossOrigin = 'anonymous'

  const source = context.createMediaElementSource(audioEl)
  const elGain = context.createGain()
  elGain.gain.value = 1
  source.connect(elGain).connect(gain)

  return { audioEl, elGain }
}

export function createAmbientVoice(context: AudioContext, trackId: TrackId): AmbientVoice {
  const gain = context.createGain()
  gain.gain.value = 0
  gain.connect(context.destination)

  const asset = AUDIO_ASSETS[trackId]
  if (asset) {
    try {
      const { audioEl, elGain } = connectRealAudioSource(context, asset, gain)
      return { audioEl, assetName: asset.name, elGain, gain, gainScale: TRACK_GAIN_SCALE[trackId], source: null, trackId }
    } catch {
      const source = connectSynthSource(context, trackId, gain)
      return {
        audioEl: null,
        assetName: 'Synthetic fallback',
        elGain: null,
        gain,
        gainScale: TRACK_GAIN_SCALE[trackId],
        source,
        trackId,
      }
    }
  }

  const source = connectSynthSource(context, trackId, gain)
  return { audioEl: null, assetName: 'Synthetic fallback', elGain: null, gain, gainScale: TRACK_GAIN_SCALE[trackId], source, trackId }
}

export function startVoice(voice: AmbientVoice): void {
  if (voice.audioEl) {
    voice.audioEl.load()
    void voice.audioEl.play().catch(() => {
      // Retried by the user-triggered AudioContext resume path.
    })
  }
}

export function pauseVoice(voice: AmbientVoice): void {
  if (voice.audioEl) {
    voice.audioEl.pause()
  }
}

export function stopVoice(voice: AmbientVoice): void {
  if (voice.source) {
    try {
      voice.source.stop()
    } catch {
      // Already stopped.
    }
  }
  if (voice.audioEl) {
    voice.audioEl.pause()
    voice.audioEl.src = ''
    voice.audioEl.load()
  }
}

export function playCueTone(context: AudioContext, intensity: BreakIntensity, volumePercent: number) {
  if (volumePercent <= 0) return

  const now = context.currentTime
  const output = context.createGain()
  const filter = context.createBiquadFilter()
  const baseVolume = intensity === 'gentle' ? 0.036 : intensity === 'standard' ? 0.048 : 0.062
  const volume = (volumePercent / 100) * baseVolume
  const tones = intensity === 'strong' ? [523.25, 659.25, 783.99] : intensity === 'standard' ? [523.25, 659.25] : [587.33, 739.99]

  filter.type = 'lowpass'
  filter.frequency.value = 2200
  output.connect(filter).connect(context.destination)

  tones.forEach((frequency, index) => {
    const start = now + index * 0.09
    const duration = intensity === 'strong' ? 0.62 : 0.48
    const oscillator = context.createOscillator()
    const toneGain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, start)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.992, start + duration)

    toneGain.gain.setValueAtTime(0.0001, start)
    toneGain.gain.linearRampToValueAtTime(volume / (index + 1), start + 0.025)
    toneGain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(toneGain).connect(output)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  })
}
