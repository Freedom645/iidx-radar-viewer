import axios from 'axios'
import type {
  TitleResponse,
  RadarResponse,
  ChartInfoResponse,
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

/** すべてのデータを並列取得 */
export async function fetchAllData() {
  const [titles, spRadar, dpRadar, chartInfo] = await Promise.all([
    fetchTitles(),
    fetchSpRadar(),
    fetchDpRadar(),
    fetchChartInfo(),
  ])
  return { titles, spRadar, dpRadar, chartInfo }
}
