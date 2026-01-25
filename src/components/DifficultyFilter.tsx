import type { Difficulty } from '@/types'
import { DIFFICULTIES } from '@/types'

interface DifficultyFilterProps {
  selected: Set<Difficulty>
  onToggle: (difficulty: Difficulty) => void
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  BEGINNER: 'bg-green-200 border-green-400 text-green-800',
  NORMAL: 'bg-sky-200 border-sky-400 text-sky-800',
  HYPER: 'bg-yellow-200 border-yellow-400 text-yellow-800',
  ANOTHER: 'bg-red-200 border-red-400 text-red-800',
  LEGGENDARIA: 'bg-purple-200 border-purple-400 text-purple-800',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: 'B',
  NORMAL: 'N',
  HYPER: 'H',
  ANOTHER: 'A',
  LEGGENDARIA: 'L',
}

export function DifficultyFilter({ selected, onToggle }: DifficultyFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DIFFICULTIES.map((difficulty) => {
        const isSelected = selected.has(difficulty)
        return (
          <label
            key={difficulty}
            className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-opacity ${
              DIFFICULTY_COLORS[difficulty]
            } ${isSelected ? 'opacity-100' : 'opacity-40'}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(difficulty)}
              className="sr-only"
            />
            <span className="text-sm font-medium">
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </label>
        )
      })}
    </div>
  )
}
