import { RADAR_TYPES, type RadarType } from '@/types'

interface RadarFilterValue {
  min: number
  max: number
}

interface RadarFilterProps {
  filters: Record<Lowercase<RadarType>, RadarFilterValue>
  onChange: (type: Lowercase<RadarType>, value: RadarFilterValue) => void
  expanded: boolean
  onToggleExpanded: () => void
}

const RADAR_LABELS: Record<RadarType, string> = {
  NOTES: 'NOTES',
  PEAK: 'PEAK',
  SCRATCH: 'SCRATCH',
  SOFLAN: 'SOF-LAN',
  CHARGE: 'CHARGE',
  CHORD: 'CHORD',
}

export function RadarFilter({
  filters,
  onChange,
  expanded,
  onToggleExpanded,
}: RadarFilterProps) {
  return (
    <div className="border border-gray-200 rounded-md">
      <button
        onClick={onToggleExpanded}
        className="w-full px-3 py-2 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50"
      >
        <span>レーダ値フィルタ</span>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RADAR_TYPES.map((type) => {
            const key = type.toLowerCase() as Lowercase<RadarType>
            const filter = filters[key]
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">
                  {RADAR_LABELS[type]}
                </span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  step={0.01}
                  value={filter.min}
                  onChange={(e) =>
                    onChange(key, { ...filter, min: Number(e.target.value) })
                  }
                  className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-xs">〜</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  step={0.01}
                  value={filter.max}
                  onChange={(e) =>
                    onChange(key, { ...filter, max: Number(e.target.value) })
                  }
                  className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
