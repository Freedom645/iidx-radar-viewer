import type { PlayMode } from '@/types'

interface PlayModeTabsProps {
  value: PlayMode
  onChange: (mode: PlayMode) => void
}

export function PlayModeTabs({ value, onChange }: PlayModeTabsProps) {
  const modes: PlayMode[] = ['SP', 'DP']

  return (
    <div className="flex border-b border-gray-200">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            value === mode
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}
