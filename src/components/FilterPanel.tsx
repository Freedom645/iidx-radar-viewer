import { useMemo } from 'react'
import { useChartStore, useFilterStore, useColumnStore } from '@/stores'
import type { ColumnId } from '@/stores'
import { SearchInput } from './SearchInput'
import { DifficultyFilter } from './DifficultyFilter'
import { LevelFilter } from './LevelFilter'
import { NumberRangeFilter } from './NumberRangeFilter'
import { RadarFilter } from './RadarFilter'
import { PackFilter } from './PackFilter'
import { VersionFilter } from './VersionFilter'
import { DifficultyTableFilter } from './DifficultyTableFilter'
import { CpiFilter } from './CpiFilter'

/** フィルタセクションのキー */
type FilterSectionKey = 'difficulty' | 'level' | 'bpm' | 'noteCount' | 'radar' | 'difficultyTable' | 'cpi'

/** フィルタセクションと対応カラムのマッピング */
const FILTER_COLUMN_MAP: Record<FilterSectionKey, ColumnId[]> = {
  difficulty: ['difficulty'],
  level: ['level'],
  bpm: ['bpm'],
  noteCount: ['noteCount'],
  radar: ['notes', 'peak', 'scratch', 'soflan', 'charge', 'chord'],
  difficultyTable: ['spNormal', 'spHard', 'dpDifficulty'],
  cpi: ['cpiEasy', 'cpiNormal', 'cpiHard', 'cpiExh', 'cpiFc'],
}

export function FilterPanel() {
  const { playMode } = useChartStore()
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
    versionFilter,
    setVersionFilter,
    selectedPackIds,
    togglePackId,
    labels,
    selectedSpNormalKeys,
    selectedSpHardKeys,
    dpDifficultyFilter,
    spDifficultyLabels,
    toggleSpNormalKey,
    toggleSpHardKey,
    setDpDifficultyFilter,
    difficultyTableFilterExpanded,
    toggleDifficultyTableFilterExpanded,
    cpiFilters,
    setCpiFilter,
    cpiFilterExpanded,
    toggleCpiFilterExpanded,
    showHiddenFilters,
    toggleShowHiddenFilters,
    filterPanelExpanded,
    toggleFilterPanelExpanded,
    resetFilters,
  } = useFilterStore()

  const { visibleColumns } = useColumnStore()

  const isFilterVisible = useMemo(() => {
    const check = (key: FilterSectionKey): boolean => {
      if (showHiddenFilters) return true
      return FILTER_COLUMN_MAP[key].some((col) => visibleColumns.has(col))
    }
    return {
      difficulty: check('difficulty'),
      level: check('level'),
      bpm: check('bpm'),
      noteCount: check('noteCount'),
      radar: check('radar'),
      difficultyTable: check('difficultyTable'),
      cpi: check('cpi'),
    }
  }, [showHiddenFilters, visibleColumns])

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* ヘッダー（常に表示） */}
      <button
        onClick={toggleFilterPanelExpanded}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
      >
        <span>検索条件</span>
        <svg
          className={`w-4 h-4 transition-transform ${filterPanelExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* パネル本体 */}
      {filterPanelExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
          {/* 非表示項目も検索する */}
          <label className="flex items-center gap-2 cursor-pointer pt-3">
            <input
              type="checkbox"
              checked={showHiddenFilters}
              onChange={toggleShowHiddenFilters}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">非表示カラムの検索条件も表示する</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 楽曲名検索（常に表示） */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">楽曲名検索</label>
              <SearchInput value={searchText} onChange={setSearchText} />
            </div>

            {/* 難易度フィルタ */}
            {isFilterVisible.difficulty && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">難易度</label>
                <DifficultyFilter
                  selected={difficulties}
                  onToggle={toggleDifficulty}
                />
              </div>
            )}

            {/* レベルフィルタ */}
            {isFilterVisible.level && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">レベル</label>
                <LevelFilter
                  min={levelMin}
                  max={levelMax}
                  onChange={setLevelRange}
                />
              </div>
            )}

            {/* BPMフィルタ */}
            {isFilterVisible.bpm && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">BPM</label>
                <NumberRangeFilter
                  min={bpmMin}
                  max={bpmMax}
                  onChange={setBpmRange}
                />
              </div>
            )}

            {/* 総ノーツ数フィルタ */}
            {isFilterVisible.noteCount && (
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
            )}

            {/* 収録状況フィルタ（常に表示） */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">収録状況</label>
              <VersionFilter
                value={versionFilter}
                onChange={setVersionFilter}
              />
            </div>

            {/* INFINITAS楽曲パックフィルタ（常に表示） */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">INFINITAS楽曲パック</label>
              <PackFilter
                labels={labels}
                selectedPackIds={selectedPackIds}
                onToggle={togglePackId}
              />
            </div>
          </div>

          {/* レーダ値フィルタ */}
          {isFilterVisible.radar && (
            <RadarFilter
              filters={radarFilters}
              onChange={setRadarFilter}
              expanded={radarFilterExpanded}
              onToggleExpanded={toggleRadarFilterExpanded}
            />
          )}

          {/* 難易度表フィルタ */}
          {isFilterVisible.difficultyTable && (
            <DifficultyTableFilter
              playMode={playMode}
              selectedSpNormalKeys={selectedSpNormalKeys}
              selectedSpHardKeys={selectedSpHardKeys}
              dpFilter={dpDifficultyFilter}
              spLabels={spDifficultyLabels}
              onToggleSpNormal={toggleSpNormalKey}
              onToggleSpHard={toggleSpHardKey}
              onDpChange={setDpDifficultyFilter}
              expanded={difficultyTableFilterExpanded}
              onToggleExpanded={toggleDifficultyTableFilterExpanded}
            />
          )}

          {/* CPIフィルタ（SPモードのみ） */}
          {playMode === 'SP' && isFilterVisible.cpi && (
            <CpiFilter
              filters={cpiFilters}
              onChange={setCpiFilter}
              expanded={cpiFilterExpanded}
              onToggleExpanded={toggleCpiFilterExpanded}
            />
          )}

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
      )}
    </div>
  )
}
