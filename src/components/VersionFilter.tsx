import type { VersionFilter as VersionFilterType } from '@/types'

const VERSION_OPTIONS: { value: VersionFilterType; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'ac', label: 'AC収録' },
  { value: 'inf', label: 'INFINITAS収録' },
]

interface VersionFilterProps {
  value: VersionFilterType
  onChange: (value: VersionFilterType) => void
}

export function VersionFilter({ value, onChange }: VersionFilterProps) {
  return (
    <div className="flex gap-1">
      {VERSION_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-xs rounded transition-colors ${
            value === option.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
