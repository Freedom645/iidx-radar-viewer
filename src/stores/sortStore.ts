import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SortingState } from '@tanstack/react-table'

interface SortState {
  /** ソート状態 */
  sorting: SortingState
  /** ソート状態を設定 */
  setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void
  /** ソートをリセット */
  resetSorting: () => void
}

const initialSorting: SortingState = [{ id: 'title', desc: false }]

export const useSortStore = create<SortState>()(
  persist(
    (set) => ({
      sorting: initialSorting,

      setSorting: (sorting) =>
        set((state) => ({
          sorting: typeof sorting === 'function' ? sorting(state.sorting) : sorting,
        })),

      resetSorting: () => set({ sorting: initialSorting }),
    }),
    {
      name: 'iidx-radar-viewer-sort',
    }
  )
)
