import { useEffect, useMemo } from 'react'
import { useChartStore, useFilterStore } from '@/stores'
import { PlayModeTabs, FilterPanel, ChartTable, ColumnSettings } from '@/components'

/** BPM文字列をパースして[min, max]を返す */
function parseBpm(bpmStr: string): [number, number] {
  if (!bpmStr || bpmStr === '-') return [0, 999]
  if (bpmStr.includes('-')) {
    const parts = bpmStr.split('-').map(Number)
    return [Math.min(...parts), Math.max(...parts)]
  }
  const num = Number(bpmStr)
  return [num, num]
}

function App() {
  const { charts, loading, error, playMode, fetchCharts, setPlayMode } =
    useChartStore()
  const {
    searchText,
    difficulties,
    levelMin,
    levelMax,
    bpmMin,
    bpmMax,
    radarFilters,
  } = useFilterStore()

  useEffect(() => {
    fetchCharts()
  }, [fetchCharts])

  const filteredCharts = useMemo(() => {
    return charts.filter((chart) => {
      // プレイモードフィルタ
      if (chart.playMode !== playMode) return false

      // 楽曲名フィルタ
      if (
        searchText &&
        !chart.title.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false
      }

      // 難易度フィルタ
      if (!difficulties.has(chart.difficulty)) return false

      // レベルフィルタ
      if (chart.level < levelMin || chart.level > levelMax) return false

      // BPMフィルタ
      const bpmMinNum = bpmMin ? Number(bpmMin) : null
      const bpmMaxNum = bpmMax ? Number(bpmMax) : null
      if (bpmMinNum !== null || bpmMaxNum !== null) {
        const [chartBpmMin, chartBpmMax] = parseBpm(chart.bpm)
        // ソフラン譜面は最小BPM〜最大BPMの範囲で判定（どちらかが範囲内なら表示）
        const minOk = bpmMinNum === null || chartBpmMax >= bpmMinNum
        const maxOk = bpmMaxNum === null || chartBpmMin <= bpmMaxNum
        if (!minOk || !maxOk) return false
      }

      // レーダ値フィルタ
      const { radar } = chart
      if (
        radar.notes < radarFilters.notes.min ||
        radar.notes > radarFilters.notes.max
      )
        return false
      if (
        radar.peak < radarFilters.peak.min ||
        radar.peak > radarFilters.peak.max
      )
        return false
      if (
        radar.scratch < radarFilters.scratch.min ||
        radar.scratch > radarFilters.scratch.max
      )
        return false
      if (
        radar.soflan < radarFilters.soflan.min ||
        radar.soflan > radarFilters.soflan.max
      )
        return false
      if (
        radar.charge < radarFilters.charge.min ||
        radar.charge > radarFilters.charge.max
      )
        return false
      if (
        radar.chord < radarFilters.chord.min ||
        radar.chord > radarFilters.chord.max
      )
        return false

      return true
    })
  }, [
    charts,
    playMode,
    searchText,
    difficulties,
    levelMin,
    levelMax,
    bpmMin,
    bpmMax,
    radarFilters,
  ])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCharts()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            IIDX Radar Viewer
          </h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* プレイモードタブ */}
        <div className="bg-white rounded-t-lg shadow-sm">
          <PlayModeTabs value={playMode} onChange={setPlayMode} />
        </div>

        {/* フィルタパネル */}
        <div className="mt-4">
          <FilterPanel />
        </div>

        {/* ツールバー */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            検索結果: <span className="font-medium">{filteredCharts.length}</span> 件
          </div>
          <ColumnSettings />
        </div>

        {/* テーブル */}
        <div className="mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-500">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>データを読み込み中...</span>
              </div>
            </div>
          ) : (
            <ChartTable data={filteredCharts} playMode={playMode} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
