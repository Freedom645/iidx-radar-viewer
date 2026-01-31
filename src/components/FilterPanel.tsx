import { useFilterStore } from '@/stores'
import { SearchInput } from './SearchInput'
import { DifficultyFilter } from './DifficultyFilter'
import { LevelFilter } from './LevelFilter'
import { NumberRangeFilter } from './NumberRangeFilter'
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
    bpmMin,
    bpmMax,
    setBpmRange,
    noteCountMin,
    noteCountMax,
    setNoteCountRange,
    radarFilters,
    setRadarFilter,
    radarFilterExpanded,
    toggleRadarFilterExpanded,
    resetFilters,
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

        {/* BPMフィルタ */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">BPM</label>
          <NumberRangeFilter
            min={bpmMin}
            max={bpmMax}
            onChange={setBpmRange}
          />
        </div>

        {/* 総ノーツ数フィルタ */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">総ノーツ数</label>
          <NumberRangeFilter
            min={noteCountMin}
            max={noteCountMax}
            onChange={setNoteCountRange}
            inputMin={1}
            inputMax={9999}
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

      {/* リセットボタン */}
      <div className="flex justify-end">
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  )
}
