import { useMemo, useState, useRef, useEffect } from 'react'
import type { PlayMode, SpDifficultyTableLabelsResponse } from '@/types'
import type { DpDifficultyFilter } from '@/stores/filterStore'

interface LabelOption {
  key: string
  label: string
}

interface DifficultyTableFilterProps {
  playMode: PlayMode
  selectedSpNormalKeys: Set<string>
  selectedSpHardKeys: Set<string>
  dpFilter: DpDifficultyFilter
  spLabels: SpDifficultyTableLabelsResponse | null
  onToggleSpNormal: (key: string) => void
  onToggleSpHard: (key: string) => void
  onDpChange: (filter: DpDifficultyFilter) => void
  expanded: boolean
  onToggleExpanded: () => void
}

/** ラベル定義からソートされたオプション一覧を生成
 * 負値(-1=未定, -2=不明)を除外。有効な最小値は0.5のため key > 0 で正しい */
function getLabelOptions(labels: Record<string, string>): LabelOption[] {
  return Object.entries(labels)
    .filter(([key]) => Number(key) > 0)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([key, label]) => ({ key, label }))
}

function MultiCheckboxDropdown({
  label,
  options,
  selectedKeys,
  onToggle,
}: {
  label: string
  options: LabelOption[]
  selectedKeys: Set<string>
  onToggle: (key: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCount = selectedKeys.size
  const buttonLabel = selectedCount > 0
    ? `${selectedCount}件選択中`
    : 'すべて'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 w-24 shrink-0">{label}</span>
      <div className="relative flex-1" ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="w-full flex items-center justify-between px-2 py-0.5 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <span className="truncate">{buttonLabel}</span>
          <svg
            className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div role="listbox" className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="max-h-60 overflow-y-auto">
                {options.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(opt.key)}
                      onChange={() => onToggle(opt.key)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 shrink-0"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function DifficultyTableFilter({
  playMode,
  selectedSpNormalKeys,
  selectedSpHardKeys,
  dpFilter,
  spLabels,
  onToggleSpNormal,
  onToggleSpHard,
  onDpChange,
  expanded,
  onToggleExpanded,
}: DifficultyTableFilterProps) {
  const normalOptions = useMemo(
    () => (spLabels ? getLabelOptions(spLabels.normal) : []),
    [spLabels]
  )
  const hardOptions = useMemo(
    () => (spLabels ? getLabelOptions(spLabels.hard) : []),
    [spLabels]
  )

  return (
    <div className="border border-gray-200 rounded-md">
      <button
        onClick={onToggleExpanded}
        className="w-full px-3 py-2 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50"
      >
        <span>難易度表フィルタ</span>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playMode === 'SP' ? (
            <>
              <MultiCheckboxDropdown
                label="ノーマル難易度"
                options={normalOptions}
                selectedKeys={selectedSpNormalKeys}
                onToggle={onToggleSpNormal}
              />
              <MultiCheckboxDropdown
                label="ハード難易度"
                options={hardOptions}
                selectedKeys={selectedSpHardKeys}
                onToggle={onToggleSpHard}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-16">DP難易度</span>
              <input
                type="number"
                value={dpFilter.min}
                onChange={(e) => onDpChange({ ...dpFilter, min: e.target.value })}
                placeholder="下限"
                step="0.1"
                min={0}
                max={12}
                className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-xs">〜</span>
              <input
                type="number"
                value={dpFilter.max}
                onChange={(e) => onDpChange({ ...dpFilter, max: e.target.value })}
                placeholder="上限"
                step="0.1"
                min={0}
                max={12}
                className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
