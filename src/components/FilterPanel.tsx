import { useFilterStore } from '@/stores'
import { SearchInput } from './SearchInput'
import { DifficultyFilter } from './DifficultyFilter'
import { LevelFilter } from './LevelFilter'
import { RadarFilter } from './RadarFilter'

export function FilterPanel() {
  const {
    searchText,
    setSearchText,
    difficulties,
    toggleDifficulty,
    levelMin,
    levelMax,
    setLevelRange,
    radarFilters,
    setRadarFilter,
    radarFilterExpanded,
    toggleRadarFilterExpanded,
  } = useFilterStore()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 楽曲名検索 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">楽曲名検索</label>
          <SearchInput value={searchText} onChange={setSearchText} />
        </div>

        {/* 難易度フィルタ */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">難易度</label>
          <DifficultyFilter
            selected={difficulties}
            onToggle={toggleDifficulty}
          />
        </div>

        {/* レベルフィルタ */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">レベル</label>
          <LevelFilter
            min={levelMin}
            max={levelMax}
            onChange={setLevelRange}
          />
        </div>
      </div>

      {/* レーダ値フィルタ */}
      <RadarFilter
        filters={radarFilters}
        onChange={setRadarFilter}
        expanded={radarFilterExpanded}
        onToggleExpanded={toggleRadarFilterExpanded}
      />
    </div>
  )
}
