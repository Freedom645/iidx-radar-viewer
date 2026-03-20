import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useChartStore, useColumnStore, COLUMN_CONFIGS, COLUMN_GROUPS } from '@/stores'
import type { ColumnConfig } from '@/stores'

function GroupCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
  label: string
}) {
  const ref = useCallback(
    (el: HTMLInputElement | null) => {
      if (el) {
        el.indeterminate = indeterminate
      }
    },
    [indeterminate]
  )

  return (
    <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer font-medium">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  )
}

export function ColumnSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { visibleColumns, toggleColumn, setColumnsVisible } = useColumnStore()
  const { playMode } = useChartStore()

  const configMap = useMemo(
    () => new Map(COLUMN_CONFIGS.map((c) => [c.id, c])),
    []
  )

  const filteredGroups = useMemo(
    () =>
      COLUMN_GROUPS.map((group) => {
        const columns = group.columnIds
          .map((id) => configMap.get(id))
          .filter((c): c is ColumnConfig => c != null && (!c.playMode || c.playMode === playMode))
        return { ...group, columns }
      }).filter((g) => g.columns.length > 0),
    [playMode, configMap]
  )

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

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>カラム設定</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 font-medium mb-2 px-2">
              表示するカラム
            </div>
            {filteredGroups.map((group) => {
              const groupColumnIds = group.columns.map((c) => c.id)
              const checkedCount = groupColumnIds.filter((id) =>
                visibleColumns.has(id)
              ).length
              const allChecked = checkedCount === groupColumnIds.length
              const noneChecked = checkedCount === 0
              const indeterminate = !allChecked && !noneChecked

              return (
                <div key={group.id} className="mb-1">
                  <GroupCheckbox
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onChange={() =>
                      setColumnsVisible(groupColumnIds, !allChecked)
                    }
                    label={group.label}
                  />
                  <div className="ml-4">
                    {group.columns.map((config) => (
                      <label
                        key={config.id}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(config.id)}
                          onChange={() => toggleColumn(config.id)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {config.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
