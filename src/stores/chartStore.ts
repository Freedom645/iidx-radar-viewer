import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChartData, PlayMode } from '@/types'
import { fetchAllData, transformToChartData } from '@/api'

interface ChartState {
  /** 全譜面データ */
  charts: ChartData[]
  /** 読み込み中フラグ */
  loading: boolean
  /** エラーメッセージ */
  error: string | null
  /** 選択中のプレイモード */
  playMode: PlayMode
  /** データを取得 */
  fetchCharts: () => Promise<void>
  /** プレイモードを変更 */
  setPlayMode: (mode: PlayMode) => void
}

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      charts: [],
      loading: false,
      error: null,
      playMode: 'SP',

      fetchCharts: async () => {
        set({ loading: true, error: null })
        try {
          const rawData = await fetchAllData()
          const charts = transformToChartData(rawData)
          set({ charts, loading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'データの取得に失敗しました'
          set({ error: message, loading: false })
        }
      },

      setPlayMode: (playMode) => {
        set({ playMode })
      },
    }),
    {
      name: 'iidx-radar-viewer-playmode',
      partialize: (state) => ({ playMode: state.playMode }),
    }
  )
)
