import type { BreakIntensity, TrackId } from '@/data'

export type AmbientVoice = {
  gain: GainNode
  source: AudioScheduledSourceNode
}

function filteredNoise(context: AudioContext, trackId: TrackId) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0

  for (let index = 0; index < data.length; index += 1) {
    const raw = Math.random() * 2 - 1
    if (trackId === 'brown_noise') {
      last = (last + 0.02 * raw) / 1.02
      data[index] = last * 3.5
    } else if (trackId === 'ocean' || trackId === 'stream' || trackId === 'forest') {
      last += (raw - last) * (trackId === 'stream' ? 0.08 : 0.035)
      data[index] = last * 0.82
    } else if (trackId === 'fireplace') {
      data[index] = Math.random() > 0.985 ? raw * 0.9 : raw * 0.08
    } else if (trackId === 'typewriter') {
      data[index] = Math.random() > 0.992 ? raw * 0.95 : raw * 0.01
    } else if (trackId === 'wind_chime') {
      data[index] = Math.sin(index / 17) * 0.07 + raw * 0.025
    } else if (trackId === 'cafe') {
      last += (raw - last) * 0.18
      data[index] = last * 0.36
    } else {
      data[index] = raw * 0.42
    }
  }

  return buffer
}

function connectFilteredSource(context: AudioContext, trackId: TrackId, gain: GainNode) {
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  source.buffer = filteredNoise(context, trackId)
  source.loop = true
  filter.type = trackId === 'white_noise' ? 'highpass' : 'lowpass'
  filter.frequency.value =
    trackId === 'rain'
      ? 4200
      : trackId === 'stream'
        ? 1600
        : trackId === 'ocean'
          ? 520
          : trackId === 'forest'
            ? 1200
            : trackId === 'fireplace'
              ? 1800
              : trackId === 'brown_noise'
                ? 720
                : 2600
  source.connect(filter).connect(gain)
  source.start()
  return source
}

function connectToneSource(context: AudioContext, trackId: TrackId, gain: GainNode) {
  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  oscillator.type = trackId === 'temple_bell' ? 'triangle' : 'sine'
  oscillator.frequency.value = trackId === 'temple_bell' ? 110 : 220
  filter.type = 'lowpass'
  filter.frequency.value = trackId === 'temple_bell' ? 460 : 720
  oscillator.connect(filter).connect(gain)
  oscillator.start()
  return oscillator
}

export function createAmbientVoice(context: AudioContext, trackId: TrackId): AmbientVoice {
  const gain = context.createGain()
  gain.gain.value = 0
  gain.connect(context.destination)

  const source =
    trackId === 'lofi' || trackId === 'temple_bell'
      ? connectToneSource(context, trackId, gain)
      : connectFilteredSource(context, trackId, gain)

  return { gain, source }
}

export function playCueTone(context: AudioContext, intensity: BreakIntensity, volumePercent: number) {
  if (volumePercent <= 0) return

  const now = context.currentTime
  const gain = context.createGain()
  const primary = context.createOscillator()
  const secondary = context.createOscillator()
  const volume = (volumePercent / 100) * (intensity === 'gentle' ? 0.055 : intensity === 'standard' ? 0.078 : 0.105)
  const duration = intensity === 'strong' ? 0.82 : intensity === 'standard' ? 0.56 : 0.42

  primary.type = 'sine'
  primary.frequency.setValueAtTime(intensity === 'gentle' ? 740 : 880, now)
  primary.frequency.exponentialRampToValueAtTime(intensity === 'strong' ? 1240 : 980, now + duration)
  secondary.type = 'triangle'
  secondary.frequency.setValueAtTime(intensity === 'strong' ? 520 : 440, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  primary.connect(gain)
  secondary.connect(gain)
  gain.connect(context.destination)

  primary.start(now)
  secondary.start(now + 0.04)
  primary.stop(now + duration)
  secondary.stop(now + duration + 0.04)
}
