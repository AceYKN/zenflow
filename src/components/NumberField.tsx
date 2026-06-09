export function NumberField({
  label,
  max,
  min,
  onChange,
  suffix,
  value,
}: {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  suffix: string
  value: number
}) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <span>
        <input
          max={max}
          min={min}
          type="number"
          value={value}
          onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value))))}
        />
        {suffix}
      </span>
    </label>
  )
}
