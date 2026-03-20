import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty, LabelResponse, SpDifficultyTableLabelsResponse, VersionFilter } from '@/types'

interface RadarFilter {
  min: number
  max: number
}

/** DP難易度表範囲フィルター */
export interface DpDifficultyFilter {
  min: string
  max: string
}

interface FilterState {
  /** 楽曲名検索 */
  searchText: string
  /** 難易度フィルタ */
  difficulties: Set<Difficulty>
  /** レベル最小値 */
  levelMin: number
  /** レベル最大値 */
  levelMax: number
  /** BPM最小値（空文字列は制限なし） */
  bpmMin: string
  /** BPM最大値（空文字列は制限なし） */
  bpmMax: string
  /** 総ノーツ数最小値（空文字列は制限なし） */
  noteCountMin: string
  /** 総ノーツ数最大値（空文字列は制限なし） */
  noteCountMax: string
  /** レーダ値フィルタ */
  radarFilters: {
    notes: RadarFilter
    peak: RadarFilter
    scratch: RadarFilter
    soflan: RadarFilter
    charge: RadarFilter
    chord: RadarFilter
  }
  /** レーダフィルタ展開状態 */
  radarFilterExpanded: boolean
  /** AC/INFINITAS収録状況フィルター */
  versionFilter: VersionFilter
  /** 選択中の楽曲パックID（空は「すべて」） */
  selectedPackIds: Set<number>
  /** パック名一覧（フィルター選択肢用） */
  labels: LabelResponse
  /** 選択中のSPノーマル難易度キー（空は「すべて」） */
  selectedSpNormalKeys: Set<string>
  /** 選択中のSPハード難易度キー（空は「すべて」） */
  selectedSpHardKeys: Set<string>
  /** DP難易度表フィルター */
  dpDifficultyFilter: DpDifficultyFilter
  /** SP難易度表ラベル定義（☆12/☆11共通） */
  spDifficultyLabels: SpDifficultyTableLabelsResponse | null
  /** 難易度表フィルタ展開状態 */
  difficultyTableFilterExpanded: boolean
  /** 検索テキストを設定 */
  setSearchText: (text: string) => void
  /** 難易度を切り替え */
  toggleDifficulty: (difficulty: Difficulty) => void
  /** 難易度を設定 */
  setDifficulties: (difficulties: Set<Difficulty>) => void
  /** レベル範囲を設定 */
  setLevelRange: (min: number, max: number) => void
  /** BPM範囲を設定 */
  setBpmRange: (min: string, max: string) => void
  /** 総ノーツ数範囲を設定 */
  setNoteCountRange: (min: string, max: string) => void
  /** レーダフィルタを設定 */
  setRadarFilter: (
    type: keyof FilterState['radarFilters'],
    filter: RadarFilter
  ) => void
  /** レーダフィルタ展開を切り替え */
  toggleRadarFilterExpanded: () => void
  /** 収録状況フィルターを設定 */
  setVersionFilter: (version: VersionFilter) => void
  /** 楽曲パックを切り替え */
  togglePackId: (packId: number) => void
  /** 楽曲パックを設定 */
  setSelectedPackIds: (packIds: Set<number>) => void
  /** パック名一覧を設定 */
  setLabels: (labels: LabelResponse) => void
  /** SPノーマル難易度キーを切り替え */
  toggleSpNormalKey: (key: string) => void
  /** SPハード難易度キーを切り替え */
  toggleSpHardKey: (key: string) => void
  /** DP難易度表フィルターを設定 */
  setDpDifficultyFilter: (filter: DpDifficultyFilter) => void
  /** SP難易度表ラベル定義を設定（☆12/☆11をマージ） */
  setSpDifficultyLabels: (sp12: SpDifficultyTableLabelsResponse, sp11: SpDifficultyTableLabelsResponse) => void
  /** 難易度表フィルタ展開を切り替え */
  toggleDifficultyTableFilterExpanded: () => void
  /** フィルタをリセット */
  resetFilters: () => void
}

const initialRadarFilter: RadarFilter = { min: 0, max: 200 }

const getInitialDifficulties = () => new Set<Difficulty>([
  'BEGINNER',
  'NORMAL',
  'HYPER',
  'ANOTHER',
  'LEGGENDARIA',
])

const getInitialRadarFilters = () => ({
  notes: { ...initialRadarFilter },
  peak: { ...initialRadarFilter },
  scratch: { ...initialRadarFilter },
  soflan: { ...initialRadarFilter },
  charge: { ...initialRadarFilter },
  chord: { ...initialRadarFilter },
})

const getInitialState = () => ({
  searchText: '',
  difficulties: getInitialDifficulties(),
  levelMin: 1,
  levelMax: 12,
  bpmMin: '',
  bpmMax: '',
  noteCountMin: '',
  noteCountMax: '',
  radarFilters: getInitialRadarFilters(),
  radarFilterExpanded: false,
  versionFilter: 'all' as VersionFilter,
  selectedPackIds: new Set<number>(),
  labels: [] as LabelResponse,
  selectedSpNormalKeys: new Set<string>(),
  selectedSpHardKeys: new Set<string>(),
  dpDifficultyFilter: { min: '', max: '' } as DpDifficultyFilter,
  spDifficultyLabels: null as SpDifficultyTableLabelsResponse | null,
  difficultyTableFilterExpanded: false,
})

/** 永続化用の型（SetをArrayに変換） */
interface PersistedFilterState {
  searchText: string
  difficulties: Difficulty[]
  levelMin: number
  levelMax: number
  bpmMin: string
  bpmMax: string
  noteCountMin: string
  noteCountMax: string
  radarFilters: FilterState['radarFilters']
  radarFilterExpanded: boolean
  versionFilter: VersionFilter
  selectedPackIds: number[]
  selectedSpNormalKeys: string[]
  selectedSpHardKeys: string[]
  dpDifficultyFilter: DpDifficultyFilter
  difficultyTableFilterExpanded: boolean
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...getInitialState(),

      setSearchText: (searchText) => set({ searchText }),

      toggleDifficulty: (difficulty) =>
        set((state) => {
          const newDifficulties = new Set(state.difficulties)
          if (newDifficulties.has(difficulty)) {
            newDifficulties.delete(difficulty)
          } else {
            newDifficulties.add(difficulty)
          }
          return { difficulties: newDifficulties }
        }),

      setDifficulties: (difficulties) => set({ difficulties }),

      setLevelRange: (levelMin, levelMax) => set({ levelMin, levelMax }),

      setBpmRange: (bpmMin, bpmMax) => set({ bpmMin, bpmMax }),

      setNoteCountRange: (noteCountMin, noteCountMax) =>
        set({ noteCountMin, noteCountMax }),

      setRadarFilter: (type, filter) =>
        set((state) => ({
          radarFilters: {
            ...state.radarFilters,
            [type]: filter,
          },
        })),

      toggleRadarFilterExpanded: () =>
        set((state) => ({ radarFilterExpanded: !state.radarFilterExpanded })),

      setVersionFilter: (versionFilter) => set({ versionFilter }),

      togglePackId: (packId) =>
        set((state) => {
          const newPackIds = new Set(state.selectedPackIds)
          if (newPackIds.has(packId)) {
            newPackIds.delete(packId)
          } else {
            newPackIds.add(packId)
          }
          return { selectedPackIds: newPackIds }
        }),

      setSelectedPackIds: (selectedPackIds) => set({ selectedPackIds }),

      setLabels: (labels) => set({ labels }),

      toggleSpNormalKey: (key) =>
        set((state) => {
          const newKeys = new Set(state.selectedSpNormalKeys)
          if (newKeys.has(key)) {
            newKeys.delete(key)
          } else {
            newKeys.add(key)
          }
          return { selectedSpNormalKeys: newKeys }
        }),

      toggleSpHardKey: (key) =>
        set((state) => {
          const newKeys = new Set(state.selectedSpHardKeys)
          if (newKeys.has(key)) {
            newKeys.delete(key)
          } else {
            newKeys.add(key)
          }
          return { selectedSpHardKeys: newKeys }
        }),

      setDpDifficultyFilter: (dpDifficultyFilter) => set({ dpDifficultyFilter }),

      setSpDifficultyLabels: (sp12, sp11) => set({
        // ☆12と☆11のラベルをマージ（同一キーは☆12を優先）
        spDifficultyLabels: {
          normal: { ...sp11.normal, ...sp12.normal },
          hard: { ...sp11.hard, ...sp12.hard },
        },
      }),

      toggleDifficultyTableFilterExpanded: () =>
        set((state) => ({ difficultyTableFilterExpanded: !state.difficultyTableFilterExpanded })),

      resetFilters: () => set((state) => ({
        ...getInitialState(),
        labels: state.labels,
        spDifficultyLabels: state.spDifficultyLabels,
      })),
    }),
    {
      name: 'iidx-radar-viewer-filters',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str) as { state: PersistedFilterState; version?: number }
          return {
            ...parsed,
            state: {
              ...parsed.state,
              difficulties: new Set(parsed.state.difficulties),
              selectedPackIds: new Set(parsed.state.selectedPackIds ?? []),
              selectedSpNormalKeys: new Set(parsed.state.selectedSpNormalKeys ?? []),
              selectedSpHardKeys: new Set(parsed.state.selectedSpHardKeys ?? []),
              dpDifficultyFilter: parsed.state.dpDifficultyFilter ?? { min: '', max: '' },
              difficultyTableFilterExpanded: parsed.state.difficultyTableFilterExpanded ?? false,
            },
          }
        },
        setItem: (name, value) => {
          const state = value.state as FilterState
          const persistedState: PersistedFilterState = {
            searchText: state.searchText,
            difficulties: Array.from(state.difficulties),
            levelMin: state.levelMin,
            levelMax: state.levelMax,
            bpmMin: state.bpmMin,
            bpmMax: state.bpmMax,
            noteCountMin: state.noteCountMin,
            noteCountMax: state.noteCountMax,
            radarFilters: state.radarFilters,
            radarFilterExpanded: state.radarFilterExpanded,
            versionFilter: state.versionFilter,
            selectedPackIds: Array.from(state.selectedPackIds),
            selectedSpNormalKeys: Array.from(state.selectedSpNormalKeys),
            selectedSpHardKeys: Array.from(state.selectedSpHardKeys),
            dpDifficultyFilter: state.dpDifficultyFilter,
            difficultyTableFilterExpanded: state.difficultyTableFilterExpanded,
          }
          localStorage.setItem(name, JSON.stringify({ ...value, state: persistedState }))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        searchText: state.searchText,
        difficulties: state.difficulties,
        levelMin: state.levelMin,
        levelMax: state.levelMax,
        bpmMin: state.bpmMin,
        bpmMax: state.bpmMax,
        noteCountMin: state.noteCountMin,
        noteCountMax: state.noteCountMax,
        radarFilters: state.radarFilters,
        radarFilterExpanded: state.radarFilterExpanded,
        versionFilter: state.versionFilter,
        selectedPackIds: state.selectedPackIds,
        selectedSpNormalKeys: state.selectedSpNormalKeys,
        selectedSpHardKeys: state.selectedSpHardKeys,
        dpDifficultyFilter: state.dpDifficultyFilter,
        difficultyTableFilterExpanded: state.difficultyTableFilterExpanded,
      }),
    }
  )
)
