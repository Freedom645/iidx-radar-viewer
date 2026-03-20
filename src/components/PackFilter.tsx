import { useMemo } from 'react'

interface PackOption {
  id: number
  name: string
}

interface PackFilterProps {
  labels: string[]
  selectedPackId: number | null
  onChange: (packId: number | null) => void
}

export function PackFilter({ labels, selectedPackId, onChange }: PackFilterProps) {
  const sortedPacks = useMemo(() => {
    const packs: PackOption[] = labels.map((name, id) => ({ id, name }))
    return packs.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  }, [labels])

  return (
    <select
      value={selectedPackId ?? ''}
      onChange={(e) => {
        const value = e.target.value
        onChange(value === '' ? null : Number(value))
      }}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">すべて</option>
      {sortedPacks.map((pack) => (
        <option key={pack.id} value={pack.id}>
          {pack.name}
        </option>
      ))}
    </select>
  )
}
