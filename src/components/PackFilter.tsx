import { useMemo, useState } from 'react'

interface PackOption {
  id: number
  name: string
}

/** 上位に固定表示するパック名（表示順） */
const PINNED_PACK_NAMES = ['初期収録曲', 'BIT解禁曲', 'DJP解禁曲']

interface PackFilterProps {
  labels: string[]
  selectedPackIds: Set<number>
  onToggle: (packId: number) => void
}

export function PackFilter({ labels, selectedPackIds, onToggle }: PackFilterProps) {
  const [expanded, setExpanded] = useState(false)

  const sortedPacks = useMemo(() => {
    const packs: PackOption[] = labels.map((name, id) => ({ id, name }))

    // 固定パックと残りを分離
    const pinned: PackOption[] = []
    const rest: PackOption[] = []

    for (const pack of packs) {
      const pinnedIndex = PINNED_PACK_NAMES.indexOf(pack.name)
      if (pinnedIndex !== -1) {
        pinned[pinnedIndex] = pack
      } else {
        rest.push(pack)
      }
    }

    // 残りを名前順でソート
    rest.sort((a, b) => a.name.localeCompare(b.name, 'ja'))

    return [...pinned.filter(Boolean), ...rest]
  }, [labels])

  if (labels.length === 0) return null

  const visiblePacks = expanded ? sortedPacks : sortedPacks.slice(0, 6)
  const hasMore = sortedPacks.length > 6

  return (
    <div className="border border-gray-200 rounded p-2 max-h-60 overflow-y-auto">
      <div className="space-y-1">
        {visiblePacks.map((pack) => (
          <label
            key={pack.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded text-sm"
          >
            <input
              type="checkbox"
              checked={selectedPackIds.has(pack.id)}
              onChange={() => onToggle(pack.id)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="truncate">{pack.name}</span>
          </label>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 w-full text-xs text-blue-500 hover:text-blue-700 py-1"
        >
          {expanded ? '折りたたむ' : `すべて表示 (${sortedPacks.length}件)`}
        </button>
      )}
    </div>
  )
}
