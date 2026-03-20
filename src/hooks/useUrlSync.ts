import { useLayoutEffect, useRef } from 'react'
import { useChartStore } from '@/stores/chartStore'
import { useFilterStore } from '@/stores/filterStore'
import { useColumnStore, COLUMN_CONFIGS } from '@/stores/columnStore'
import { useSortStore } from '@/stores/sortStore'
import type { ColumnId } from '@/stores/columnStore'
import type { PlayMode, Difficulty, VersionFilter, CpiClearType } from '@/types'
import { CPI_CLEAR_TYPES, DIFFICULTIES } from '@/types'

const RADAR_TYPES_KEYS = ['notes', 'peak', 'scratch', 'soflan', 'charge', 'chord'] as const

/** デフォルト値（URLに含めないための比較用） */
const DEFAULTS = {
  playMode: 'SP' as PlayMode,
  searchText: '',
  difficulties: new Set<Difficulty>(DIFFICULTIES),
  levelMin: 1,
  levelMax: 12,
  bpmMin: '',
  bpmMax: '',
  noteCountMin: '',
  noteCountMax: '',
  radarMin: 0,
  radarMax: 200,
  versionFilter: 'all' as VersionFilter,
  selectedPackIds: new Set<number>(),
  selectedSpNormalKeys: new Set<string>(),
  selectedSpHardKeys: new Set<string>(),
  dpDifficultyMin: '',
  dpDifficultyMax: '',
  cpiMin: '',
  cpiMax: '',
  showHiddenFilters: false,
}

const defaultVisibleColumns = new Set(
  COLUMN_CONFIGS.filter((c) => c.defaultVisible).map((c) => c.id)
)

/** 難易度の略称マッピング */
const DIFFICULTY_SHORT_MAP: Record<string, Difficulty> = {
  B: 'BEGINNER',
  N: 'NORMAL',
  H: 'HYPER',
  A: 'ANOTHER',
  L: 'LEGGENDARIA',
}
const DIFFICULTY_TO_SHORT: Record<Difficulty, string> = {
  BEGINNER: 'B',
  NORMAL: 'N',
  HYPER: 'H',
  ANOTHER: 'A',
  LEGGENDARIA: 'L',
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false
  for (const item of a) {
    if (!b.has(item)) return false
  }
  return true
}

/** 現在の状態からURLパラメータを構築 */
function buildSearchParams(): URLSearchParams {
  const params = new URLSearchParams()
  const chart = useChartStore.getState()
  const filter = useFilterStore.getState()
  const column = useColumnStore.getState()
  const sort = useSortStore.getState()

  // playMode
  if (chart.playMode !== DEFAULTS.playMode) {
    params.set('pm', chart.playMode)
  }

  // searchText
  if (filter.searchText !== DEFAULTS.searchText) {
    params.set('q', filter.searchText)
  }

  // difficulties
  if (!setsEqual(filter.difficulties, DEFAULTS.difficulties)) {
    const shorts = Array.from(filter.difficulties).map((d) => DIFFICULTY_TO_SHORT[d])
    params.set('d', shorts.join(','))
  }

  // level range
  if (filter.levelMin !== DEFAULTS.levelMin || filter.levelMax !== DEFAULTS.levelMax) {
    params.set('lv', `${filter.levelMin}-${filter.levelMax}`)
  }

  // BPM range
  if (filter.bpmMin !== DEFAULTS.bpmMin || filter.bpmMax !== DEFAULTS.bpmMax) {
    params.set('bpm', `${filter.bpmMin}-${filter.bpmMax}`)
  }

  // noteCount range
  if (filter.noteCountMin !== DEFAULTS.noteCountMin || filter.noteCountMax !== DEFAULTS.noteCountMax) {
    params.set('nc', `${filter.noteCountMin}-${filter.noteCountMax}`)
  }

  // radar filters
  for (const type of RADAR_TYPES_KEYS) {
    const rf = filter.radarFilters[type]
    if (rf.min !== DEFAULTS.radarMin || rf.max !== DEFAULTS.radarMax) {
      params.set(`r_${type}`, `${rf.min}-${rf.max}`)
    }
  }

  // version
  if (filter.versionFilter !== DEFAULTS.versionFilter) {
    params.set('ver', filter.versionFilter)
  }

  // packs
  if (filter.selectedPackIds.size > 0) {
    params.set('pk', Array.from(filter.selectedPackIds).join(','))
  }

  // SP difficulty table
  if (filter.selectedSpNormalKeys.size > 0) {
    params.set('spn', Array.from(filter.selectedSpNormalKeys).join(','))
  }
  if (filter.selectedSpHardKeys.size > 0) {
    params.set('sph', Array.from(filter.selectedSpHardKeys).join(','))
  }

  // DP difficulty
  if (filter.dpDifficultyFilter.min !== DEFAULTS.dpDifficultyMin || filter.dpDifficultyFilter.max !== DEFAULTS.dpDifficultyMax) {
    params.set('dpd', `${filter.dpDifficultyFilter.min}-${filter.dpDifficultyFilter.max}`)
  }

  // CPI filters
  for (const clearType of CPI_CLEAR_TYPES) {
    const cf = filter.cpiFilters[clearType]
    if (cf.min !== DEFAULTS.cpiMin || cf.max !== DEFAULTS.cpiMax) {
      params.set(`cpi_${clearType}`, `${cf.min}-${cf.max}`)
    }
  }

  // sorting
  if (sort.sorting.length > 0) {
    const s = sort.sorting[0]
    const defaultSort = s.id === 'title' && !s.desc
    if (!defaultSort) {
      params.set('sort', `${s.id}:${s.desc ? 'desc' : 'asc'}`)
    }
  }

  // visible columns
  if (!setsEqual(column.visibleColumns, defaultVisibleColumns)) {
    params.set('cols', Array.from(column.visibleColumns).join(','))
  }

  // showHiddenFilters
  if (filter.showHiddenFilters) {
    params.set('shf', '1')
  }

  return params
}

/** URLパラメータから状態を復元 */
function restoreFromUrl(params: URLSearchParams): boolean {
  if (params.size === 0) return false

  const chart = useChartStore.getState()
  const filter = useFilterStore.getState()
  const column = useColumnStore.getState()
  const sort = useSortStore.getState()

  // playMode
  const pm = params.get('pm')
  if (pm === 'SP' || pm === 'DP') {
    chart.setPlayMode(pm)
  }

  // searchText
  const q = params.get('q')
  if (q !== null) {
    filter.setSearchText(q)
  }

  // difficulties
  const d = params.get('d')
  if (d !== null) {
    const diffs = new Set<Difficulty>(
      d.split(',').map((s) => DIFFICULTY_SHORT_MAP[s]).filter(Boolean)
    )
    filter.setDifficulties(diffs)
  }

  // level
  const lv = params.get('lv')
  if (lv !== null) {
    const [min, max] = lv.split('-').map(Number)
    if (!isNaN(min) && !isNaN(max)) {
      filter.setLevelRange(min, max)
    }
  }

  // BPM
  const bpm = params.get('bpm')
  if (bpm !== null) {
    const [min, max] = bpm.split('-')
    filter.setBpmRange(min ?? '', max ?? '')
  }

  // noteCount
  const nc = params.get('nc')
  if (nc !== null) {
    const [min, max] = nc.split('-')
    filter.setNoteCountRange(min ?? '', max ?? '')
  }

  // radar filters
  for (const type of RADAR_TYPES_KEYS) {
    const rv = params.get(`r_${type}`)
    if (rv !== null) {
      const [min, max] = rv.split('-').map(Number)
      if (!isNaN(min) && !isNaN(max)) {
        filter.setRadarFilter(type, { min, max })
      }
    }
  }

  // version
  const ver = params.get('ver')
  if (ver === 'ac' || ver === 'inf' || ver === 'all') {
    filter.setVersionFilter(ver)
  }

  // packs
  const pk = params.get('pk')
  if (pk !== null) {
    const ids = new Set(pk.split(',').map(Number).filter((n) => !isNaN(n)))
    filter.setSelectedPackIds(ids)
  }

  // SP difficulty table
  const spn = params.get('spn')
  if (spn !== null) {
    filter.setSelectedSpNormalKeys(new Set(spn.split(',')))
  }
  const sph = params.get('sph')
  if (sph !== null) {
    filter.setSelectedSpHardKeys(new Set(sph.split(',')))
  }

  // DP difficulty
  const dpd = params.get('dpd')
  if (dpd !== null) {
    const [min, max] = dpd.split('-')
    filter.setDpDifficultyFilter({ min: min ?? '', max: max ?? '' })
  }

  // CPI filters
  for (const clearType of CPI_CLEAR_TYPES) {
    const cv = params.get(`cpi_${clearType}`)
    if (cv !== null) {
      const [min, max] = cv.split('-')
      filter.setCpiFilter(clearType as CpiClearType, { min: min ?? '', max: max ?? '' })
    }
  }

  // sorting
  const sortParam = params.get('sort')
  if (sortParam !== null) {
    const [col, dir] = sortParam.split(':')
    if (col) {
      sort.setSorting([{ id: col, desc: dir === 'desc' }])
    }
  }

  // visible columns
  const cols = params.get('cols')
  if (cols !== null) {
    const validColumnIds = new Set<ColumnId>(COLUMN_CONFIGS.map((c) => c.id))
    const colIds = new Set(
      cols.split(',').filter((id): id is ColumnId => validColumnIds.has(id as ColumnId))
    )
    for (const id of validColumnIds) {
      column.setColumnVisible(id, colIds.has(id))
    }
  }

  // showHiddenFilters
  const shf = params.get('shf')
  if (shf === '1') {
    filter.setShowHiddenFilters(true)
  }

  return true
}

export function useUrlSync() {
  const isRestoringRef = useRef(false)
  const rafIdRef = useRef<number | null>(null)

  // マウント時にURL解析 → ストアに反映
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.size > 0) {
      isRestoringRef.current = true
      restoreFromUrl(params)
      // 次のフレームで復元完了フラグをクリア
      requestAnimationFrame(() => {
        isRestoringRef.current = false
      })
    }
  }, [])

  // ストア変更を監視してURL更新
  useLayoutEffect(() => {
    const scheduleUrlUpdate = () => {
      if (isRestoringRef.current) return
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        const params = buildSearchParams()
        const search = params.toString()
        const currentSearch = window.location.search.slice(1)
        if (currentSearch !== search) {
          const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname
          window.history.replaceState(null, '', newUrl)
        }
      })
    }

    const unsubs = [
      useChartStore.subscribe(scheduleUrlUpdate),
      useFilterStore.subscribe(scheduleUrlUpdate),
      useColumnStore.subscribe(scheduleUrlUpdate),
      useSortStore.subscribe(scheduleUrlUpdate),
    ]

    return () => {
      unsubs.forEach((unsub) => unsub())
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])
}
