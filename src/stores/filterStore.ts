import { create } from 'zustand'
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

const initialState = {
  searchText: '',
  difficulties: new Set<Difficulty>([
    'BEGINNER',
    'NORMAL',
    'HYPER',
    'ANOTHER',
    'LEGGENDARIA',
  ]),
  levelMin: 1,
  levelMax: 12,
  radarFilters: {
    notes: { ...initialRadarFilter },
    peak: { ...initialRadarFilter },
    scratch: { ...initialRadarFilter },
    soflan: { ...initialRadarFilter },
    charge: { ...initialRadarFilter },
    chord: { ...initialRadarFilter },
  },
  radarFilterExpanded: false,
}

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,

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

  setRadarFilter: (type, filter) =>
    set((state) => ({
      radarFilters: {
        ...state.radarFilters,
        [type]: filter,
      },
    })),

  toggleRadarFilterExpanded: () =>
    set((state) => ({ radarFilterExpanded: !state.radarFilterExpanded })),

  resetFilters: () => set(initialState),
}))
