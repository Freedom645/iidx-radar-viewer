interface BpmFilterProps {
  min: string
  max: string
  onChange: (min: string, max: string) => void
}

export function BpmFilter({ min, max, onChange }: BpmFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={min}
        onChange={(e) => onChange(e.target.value, max)}
        placeholder="下限"
        min={1}
        max={999}
        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-gray-500">〜</span>
      <input
        type="number"
        value={max}
        onChange={(e) => onChange(min, e.target.value)}
        placeholder="上限"
        min={1}
        max={999}
        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
