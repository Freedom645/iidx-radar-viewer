import type { PlayMode } from '@/types'

interface PlayModeTabsProps {
  value: PlayMode
  onChange: (mode: PlayMode) => void
}

export function PlayModeTabs({ value, onChange }: PlayModeTabsProps) {
  const modes: PlayMode[] = ['SP', 'DP']

  return (
    <div className="flex rounded-md overflow-hidden border border-gray-200">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            value === mode
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}
