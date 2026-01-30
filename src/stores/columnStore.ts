import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColumnId =
  | 'title'
  | 'difficulty'
  | 'level'
  | 'bpm'
  | 'noteCount'
  | 'notes'
  | 'peak'
  | 'scratch'
  | 'soflan'
  | 'charge'
  | 'chord'

export interface ColumnConfig {
  id: ColumnId
  label: string
  defaultVisible: boolean
  defaultVisibleMobile: boolean
}

export const COLUMN_CONFIGS: ColumnConfig[] = [
  { id: 'title', label: '楽曲名', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'difficulty', label: '難易度', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'level', label: 'Lv', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'bpm', label: 'BPM', defaultVisible: true, defaultVisibleMobile: false },
  { id: 'noteCount', label: '総ノーツ数', defaultVisible: true, defaultVisibleMobile: false },
  { id: 'notes', label: 'NOTES', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'peak', label: 'PEAK', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'scratch', label: 'SCRATCH', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'soflan', label: 'SOF-LAN', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'charge', label: 'CHARGE', defaultVisible: true, defaultVisibleMobile: true },
  { id: 'chord', label: 'CHORD', defaultVisible: true, defaultVisibleMobile: true },
]

interface ColumnState {
  /** 表示するカラムID */
  visibleColumns: Set<ColumnId>
  /** カラムの表示/非表示を切り替え */
  toggleColumn: (id: ColumnId) => void
  /** カラムの表示状態を設定 */
  setColumnVisible: (id: ColumnId, visible: boolean) => void
  /** デフォルトにリセット */
  resetColumns: (isMobile: boolean) => void
}

const getDefaultColumns = (isMobile: boolean): Set<ColumnId> => {
  return new Set(
    COLUMN_CONFIGS.filter((c) =>
      isMobile ? c.defaultVisibleMobile : c.defaultVisible
    ).map((c) => c.id)
  )
}

export const useColumnStore = create<ColumnState>()(
  persist(
    (set) => ({
      visibleColumns: getDefaultColumns(false),

      toggleColumn: (id) =>
        set((state) => {
          const newColumns = new Set(state.visibleColumns)
          if (newColumns.has(id)) {
            newColumns.delete(id)
          } else {
            newColumns.add(id)
          }
          return { visibleColumns: newColumns }
        }),

      setColumnVisible: (id, visible) =>
        set((state) => {
          const newColumns = new Set(state.visibleColumns)
          if (visible) {
            newColumns.add(id)
          } else {
            newColumns.delete(id)
          }
          return { visibleColumns: newColumns }
        }),

      resetColumns: (isMobile) =>
        set({ visibleColumns: getDefaultColumns(isMobile) }),
    }),
    {
      name: 'iidx-radar-viewer-columns',
      partialize: (state) => ({
        visibleColumns: Array.from(state.visibleColumns),
      }),
      merge: (persisted, current) => ({
        ...current,
        visibleColumns: new Set(
          (persisted as { visibleColumns?: ColumnId[] })?.visibleColumns ??
          Array.from(current.visibleColumns)
        ),
      }),
    }
  )
)
