import { CPI_CLEAR_TYPES, CPI_CLEAR_TYPE_LABELS, type CpiClearType } from '@/types'

interface CpiRangeFilter {
  min: string
  max: string
}

interface CpiFilterProps {
  filters: Record<CpiClearType, CpiRangeFilter>
  onChange: (clearType: CpiClearType, value: CpiRangeFilter) => void
  expanded: boolean
  onToggleExpanded: () => void
}

export function CpiFilter({
  filters,
  onChange,
  expanded,
  onToggleExpanded,
}: CpiFilterProps) {
  return (
    <div className="border border-gray-200 rounded-md">
      <button
        onClick={onToggleExpanded}
        className="w-full px-3 py-2 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50"
      >
        <span>CPIフィルタ</span>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CPI_CLEAR_TYPES.map((clearType) => {
            const filter = filters[clearType]
            return (
              <div key={clearType} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">
                  {CPI_CLEAR_TYPE_LABELS[clearType]}
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={filter.min}
                  onChange={(e) =>
                    onChange(clearType, { ...filter, min: e.target.value })
                  }
                  placeholder="min"
                  className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-xs">〜</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={filter.max}
                  onChange={(e) =>
                    onChange(clearType, { ...filter, max: e.target.value })
                  }
                  placeholder="max"
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
