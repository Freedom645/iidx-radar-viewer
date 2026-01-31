import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty } from '@/types'

interface RadarFilter {
  min: number
  max: number
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

      resetFilters: () => set(getInitialState()),
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
      }),
    }
  )
)
