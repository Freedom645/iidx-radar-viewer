import axios from 'axios'
import type {
  TitleResponse,
  RadarResponse,
  ChartInfoResponse,
  LabelResponse,
  SongToLabelResponse,
} from '@/types'

const BASE_URL = 'https://chinimuruhi.github.io/IIDX-Data-Table'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

/** 楽曲名を取得 */
export async function fetchTitles(): Promise<TitleResponse> {
  const response = await client.get<TitleResponse>('/textage/title.json')
  return response.data
}

/** SPレーダ値を取得 */
export async function fetchSpRadar(): Promise<RadarResponse> {
  const response = await client.get<RadarResponse>('/notes_radar/sp.json')
  return response.data
}

/** DPレーダ値を取得 */
export async function fetchDpRadar(): Promise<RadarResponse> {
  const response = await client.get<RadarResponse>('/notes_radar/dp.json')
  return response.data
}

/** 譜面情報を取得 */
export async function fetchChartInfo(): Promise<ChartInfoResponse> {
  const response = await client.get<ChartInfoResponse>('/textage/chart-info.json')
  return response.data
}

/** パック名一覧を取得 */
export async function fetchLabels(): Promise<LabelResponse> {
  const response = await client.get<LabelResponse>('/konami/label.json')
  return response.data
}

/** 楽曲とパックの紐づけを取得 */
export async function fetchSongToLabel(): Promise<SongToLabelResponse> {
  const response = await client.get<SongToLabelResponse>('/konami/song_to_label.json')
  return response.data
}

/** すべてのデータを並列取得 */
export async function fetchAllData() {
  const [titles, spRadar, dpRadar, chartInfo, labels, songToLabel] = await Promise.all([
    fetchTitles(),
    fetchSpRadar(),
    fetchDpRadar(),
    fetchChartInfo(),
    fetchLabels(),
    fetchSongToLabel(),
  ])
  return { titles, spRadar, dpRadar, chartInfo, labels, songToLabel }
}
