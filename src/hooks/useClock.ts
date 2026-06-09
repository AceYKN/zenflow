import { useEffect, useState } from 'react'

type ClockSource = 'syncing' | 'public' | 'local'

type ClockState = {
  now: Date
  source: ClockSource
  sourceLabel: string
}

type WorldTimeResponse = {
  unixtime?: number
  utc_datetime?: string
}

type TimeApiResponse = {
  dateTime?: string
  day?: number
  hour?: number
  milliSeconds?: number
  minute?: number
  month?: number
  seconds?: number
  year?: number
}

const TIMEOUT_MS = 3500

async function fetchWithTimeout(url: string) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!response.ok) throw new Error(`Time request failed: ${response.status}`)
    return response
  } finally {
    window.clearTimeout(timer)
  }
}

function parseWorldTime(data: WorldTimeResponse) {
  if (typeof data.unixtime === 'number') return data.unixtime * 1000
  if (data.utc_datetime) return Date.parse(data.utc_datetime)
  return Number.NaN
}

function parseTimeApi(data: TimeApiResponse) {
  if (
    typeof data.year === 'number' &&
    typeof data.month === 'number' &&
    typeof data.day === 'number' &&
    typeof data.hour === 'number' &&
    typeof data.minute === 'number' &&
    typeof data.seconds === 'number'
  ) {
    return new Date(
      data.year,
      data.month - 1,
      data.day,
      data.hour,
      data.minute,
      data.seconds,
      data.milliSeconds ?? 0,
    ).getTime()
  }
  return data.dateTime ? Date.parse(data.dateTime) : Number.NaN
}

async function getPublicTimeOffset() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const endpoints = [
    {
      label: 'TimeAPI.io',
      parse: parseTimeApi,
      url: `https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(timeZone)}`,
    },
    {
      label: 'WorldTimeAPI',
      parse: parseWorldTime,
      url: 'https://worldtimeapi.org/api/ip',
    },
  ] as const

  for (const endpoint of endpoints) {
    try {
      const before = Date.now()
      const response = await fetchWithTimeout(endpoint.url)
      const after = Date.now()
      const serverTime = endpoint.parse((await response.json()) as never)
      if (Number.isFinite(serverTime)) {
        const midpoint = before + (after - before) / 2
        return { label: endpoint.label, offset: serverTime - midpoint }
      }
    } catch {
      // Try the next public time source.
    }
  }

  return null
}

export function useClock(): ClockState {
  const [offset, setOffset] = useState(0)
  const [source, setSource] = useState<ClockSource>('syncing')
  const [sourceLabel, setSourceLabel] = useState('公共时间校准中')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let cancelled = false

    void getPublicTimeOffset().then((result) => {
      if (cancelled) return
      if (result) {
        setOffset(result.offset)
        setSource('public')
        setSourceLabel(`${result.label} 校准`)
      } else {
        setOffset(0)
        setSource('local')
        setSourceLabel('本机时间')
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const tick = () => setNow(new Date(Date.now() + offset))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [offset])

  return { now, source, sourceLabel }
}
