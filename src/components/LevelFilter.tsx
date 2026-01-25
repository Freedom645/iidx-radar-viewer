interface LevelFilterProps {
  min: number
  max: number
  onChange: (min: number, max: number) => void
}

const LEVELS = Array.from({ length: 12 }, (_, i) => i + 1)

export function LevelFilter({ min, max, onChange }: LevelFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={min}
        onChange={(e) => {
          const newMin = Number(e.target.value)
          onChange(newMin, Math.max(newMin, max))
        }}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <span className="text-gray-500">〜</span>
      <select
        value={max}
        onChange={(e) => {
          const newMax = Number(e.target.value)
          onChange(Math.min(min, newMax), newMax)
        }}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </div>
  )
}
