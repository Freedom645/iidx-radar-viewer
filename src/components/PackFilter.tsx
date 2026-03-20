import { useMemo, useState, useRef, useEffect } from 'react'

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

  const sortedPacks = useMemo(() => {
    const packs: PackOption[] = labels.map((name, id) => ({ id, name }))

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

    rest.sort((a, b) => a.name.localeCompare(b.name, 'ja'))

    return [...pinned.filter(Boolean), ...rest]
  }, [labels])

  if (labels.length === 0) return null

  const selectedCount = selectedPackIds.size
  const buttonLabel = selectedCount > 0
    ? `${selectedCount}件選択中`
    : 'すべて'

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="truncate">{buttonLabel}</span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 font-medium mb-2 px-2">
              INFINITAS楽曲パック
            </div>
            <div className="max-h-60 overflow-y-auto">
              {sortedPacks.map((pack) => (
                <label
                  key={pack.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPackIds.has(pack.id)}
                    onChange={() => onToggle(pack.id)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-sm text-gray-700">{pack.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
