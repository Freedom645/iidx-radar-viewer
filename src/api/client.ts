import axios from 'axios'
import type {
  TitleResponse,
  RadarResponse,
  ChartInfoResponse,
  LabelResponse,
  SongToLabelResponse,
  SpDifficultyTableSongsResponse,
  SpDifficultyTableLabelsResponse,
  DpDifficultyTableSongsResponse,
  CpiResponse,
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

/** SP☆12難易度表の譜面データを取得 */
export async function fetchSp12DifficultySongs(): Promise<SpDifficultyTableSongsResponse> {
  const response = await client.get<SpDifficultyTableSongsResponse>('/difficulty/sp12/songs_dict.json')
  return response.data
}

/** SP☆12難易度表のラベル定義を取得 */
export async function fetchSp12DifficultyLabels(): Promise<SpDifficultyTableLabelsResponse> {
  const response = await client.get<SpDifficultyTableLabelsResponse>('/difficulty/sp12/difficulty.json')
  return response.data
}

/** SP☆11難易度表の譜面データを取得 */
export async function fetchSp11DifficultySongs(): Promise<SpDifficultyTableSongsResponse> {
  const response = await client.get<SpDifficultyTableSongsResponse>('/difficulty/sp11/songs_dict.json')
  return response.data
}

/** SP☆11難易度表のラベル定義を取得 */
export async function fetchSp11DifficultyLabels(): Promise<SpDifficultyTableLabelsResponse> {
  const response = await client.get<SpDifficultyTableLabelsResponse>('/difficulty/sp11/difficulty.json')
  return response.data
}

/** DP難易度表の譜面データを取得 */
export async function fetchDpDifficultySongs(): Promise<DpDifficultyTableSongsResponse> {
  const response = await client.get<DpDifficultyTableSongsResponse>('/difficulty/dp/songs_dict.json')
  return response.data
}

/** CPIデータを取得 */
export async function fetchCpiData(): Promise<CpiResponse> {
  const response = await client.get<CpiResponse>('/cpi/songs_dict.json')
  return response.data
}

/** 難易度表データのデフォルト値（取得失敗時に使用） */
const EMPTY_SP_DIFFICULTY_SONGS: SpDifficultyTableSongsResponse = {}
const EMPTY_SP_DIFFICULTY_LABELS: SpDifficultyTableLabelsResponse = { hard: {}, normal: {} }
const EMPTY_DP_DIFFICULTY_SONGS: DpDifficultyTableSongsResponse = {}
const EMPTY_CPI_DATA: CpiResponse = {}

/** すべてのデータを並列取得 */
export async function fetchAllData() {
  // 必須データ
  const [titles, spRadar, dpRadar, chartInfo, labels, songToLabel] = await Promise.all([
    fetchTitles(),
    fetchSpRadar(),
    fetchDpRadar(),
    fetchChartInfo(),
    fetchLabels(),
    fetchSongToLabel(),
  ])

  // 難易度表データ（非必須: 失敗しても空データとして扱う）
  const difficultyResults = await Promise.allSettled([
    fetchSp12DifficultySongs(),
    fetchSp12DifficultyLabels(),
    fetchSp11DifficultySongs(),
    fetchSp11DifficultyLabels(),
    fetchDpDifficultySongs(),
    fetchCpiData(),
  ])

  const sp12Songs = difficultyResults[0].status === 'fulfilled' ? difficultyResults[0].value : EMPTY_SP_DIFFICULTY_SONGS
  const sp12Labels = difficultyResults[1].status === 'fulfilled' ? difficultyResults[1].value : EMPTY_SP_DIFFICULTY_LABELS
  const sp11Songs = difficultyResults[2].status === 'fulfilled' ? difficultyResults[2].value : EMPTY_SP_DIFFICULTY_SONGS
  const sp11Labels = difficultyResults[3].status === 'fulfilled' ? difficultyResults[3].value : EMPTY_SP_DIFFICULTY_LABELS
  const dpDifficultySongs = difficultyResults[4].status === 'fulfilled' ? difficultyResults[4].value : EMPTY_DP_DIFFICULTY_SONGS
  const cpiData = difficultyResults[5].status === 'fulfilled' ? difficultyResults[5].value : EMPTY_CPI_DATA

  return {
    titles, spRadar, dpRadar, chartInfo, labels, songToLabel,
    sp12Songs, sp12Labels, sp11Songs, sp11Labels, dpDifficultySongs, cpiData,
  }
}
