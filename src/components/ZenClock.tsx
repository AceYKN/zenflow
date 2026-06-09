import type { ClockStyle, TimeFormat } from '@/data'

export function ZenClock({
  now,
  style,
  timeFormat,
  showSeconds,
  onClick,
}: {
  now: Date
  style: ClockStyle
  timeFormat: TimeFormat
  showSeconds: boolean
  onClick: () => void
}) {
  const hours = now.getHours()
  const displayHours = timeFormat === '24h' ? hours : hours % 12 || 12
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const period = timeFormat === '12h' ? (hours >= 12 ? 'PM' : 'AM') : ''
  const timeText = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <button className={`clock-face ${style}`} type="button" onClick={onClick} aria-label="切换时钟样式">
      {style === 'dial' ? (
        <DialClock hours={hours} minutes={minutes} seconds={seconds} label={`${timeText} ${period}`.trim()} />
      ) : null}
      {style === 'flip' ? (
        <FlipClock hours={displayHours} minutes={minutes} seconds={seconds} period={period} showSeconds={showSeconds} />
      ) : null}
      {style === 'ink' ? (
        <span className="ink-clock" aria-live="polite">
          <span>{timeText}</span>
          <small className={showSeconds ? 'visible' : ''}>{period || ' '}</small>
        </span>
      ) : null}
    </button>
  )
}

function DialClock({
  hours,
  minutes,
  seconds,
  label,
}: {
  hours: number
  minutes: number
  seconds: number
  label: string
}) {
  const minuteAngle = minutes * 6 + seconds * 0.1
  const hourAngle = (hours % 12) * 30 + minutes * 0.5
  const secondAngle = seconds * 6
  const numbers = Array.from({ length: 12 }, (_, index) => {
    const value = index + 1
    const angle = (value * 30 - 90) * (Math.PI / 180)
    return {
      value,
      x: 120 + Math.cos(angle) * 78,
      y: 120 + Math.sin(angle) * 78,
    }
  })

  return (
    <span className="dial-clock">
      <svg viewBox="0 0 240 240" aria-hidden="true">
        <circle className="dial-ring" cx="120" cy="120" r="96" />
        {numbers.map((number) => (
          <text className="dial-number" dominantBaseline="middle" key={number.value} textAnchor="middle" x={number.x} y={number.y}>
            {number.value}
          </text>
        ))}
        <g transform={`rotate(${hourAngle} 120 120)`}>
          <line className="hour-hand" x1="120" y1="120" x2="120" y2="70" />
        </g>
        <g transform={`rotate(${minuteAngle} 120 120)`}>
          <line className="minute-hand" x1="120" y1="120" x2="120" y2="48" />
        </g>
        <g transform={`rotate(${secondAngle} 120 120)`}>
          <line className="second-hand" x1="120" y1="126" x2="120" y2="42" />
        </g>
        <circle className="dial-dot" cx="120" cy="120" r="3.5" />
      </svg>
      <small>{label}</small>
    </span>
  )
}

function FlipClock({
  hours,
  minutes,
  seconds,
  period,
  showSeconds,
}: {
  hours: number
  minutes: number
  seconds: number
  period: string
  showSeconds: boolean
}) {
  const hourParts = String(hours).padStart(2, '0').split('')
  const minuteParts = String(minutes).padStart(2, '0').split('')
  const secondParts = String(seconds).padStart(2, '0').split('')

  return (
    <span className="flip-clock" aria-live="polite">
      <span className="flip-group">
        {hourParts.map((digit, index) => (
          <span className="flip-card" key={`h-${index}-${digit}`}>{digit}</span>
        ))}
      </span>
      <span className="flip-separator">:</span>
      <span className="flip-group">
        {minuteParts.map((digit, index) => (
          <span className="flip-card" key={`m-${index}-${digit}`}>{digit}</span>
        ))}
      </span>
      <span className="flip-separator">:</span>
      <span className="flip-group">
        {secondParts.map((digit, index) => (
          <span className="flip-card" key={`s-${index}-${digit}`}>{digit}</span>
        ))}
      </span>
      <small className={showSeconds ? 'visible' : ''}>{period || ' '}</small>
    </span>
  )
}
