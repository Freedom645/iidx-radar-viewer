import type {
  ChartData,
  ChartInfoResponse,
  Difficulty,
  DpDifficultyRating,
  DpDifficultyTableSongsResponse,
  LabelResponse,
  PlayMode,
  RadarData,
  RadarResponse,
  SongToLabelResponse,
  SpDifficultyRating,
  SpDifficultyTableLabelsResponse,
  SpDifficultyTableSongsResponse,
  TitleResponse,
} from "@/types";
import {
  DIFFICULTIES,
  DIFFICULTY_INDEX,
  formatBpmForDifficulty,
  isBpmPerDifficulty,
  tableKeyFromDifficulty,
} from "@/types";

interface RawData {
  titles: TitleResponse;
  spRadar: RadarResponse;
  dpRadar: RadarResponse;
  chartInfo: ChartInfoResponse;
  labels: LabelResponse;
  songToLabel: SongToLabelResponse;
  sp12Songs: SpDifficultyTableSongsResponse;
  sp12Labels: SpDifficultyTableLabelsResponse;
  sp11Songs: SpDifficultyTableSongsResponse;
  sp11Labels: SpDifficultyTableLabelsResponse;
  dpDifficultySongs: DpDifficultyTableSongsResponse;
}

/** パック情報を解決 */
function resolveLabel(
  songLabel: SongToLabelResponse[string] | undefined,
  difficulty: string,
  labels: LabelResponse,
): { labelId: number | null; labelName: string | null } {
  const isInPack =
    songLabel != null &&
    (difficulty !== "LEGGENDARIA" || songLabel.in_leggendaria);
  const labelId = isInPack ? songLabel.label : null;
  const labelName = labelId != null ? (labels[labelId] ?? null) : null;
  return { labelId, labelName };
}

/** レーダ値を抽出 */
function extractRadar(
  radar: RadarResponse[string] | undefined,
  difficultyIndex: number,
): RadarData | null {
  if (!radar) return null;

  const notes = radar.NOTES?.[difficultyIndex] ?? 0;
  const peak = radar.PEAK?.[difficultyIndex] ?? 0;
  const scratch = radar.SCRATCH?.[difficultyIndex] ?? 0;
  const soflan = radar.SOFLAN?.[difficultyIndex] ?? 0;
  const charge = radar.CHARGE?.[difficultyIndex] ?? 0;
  const chord = radar.CHORD?.[difficultyIndex] ?? 0;

  // すべて0の場合は譜面が存在しない
  if (
    notes === 0 &&
    peak === 0 &&
    scratch === 0 &&
    soflan === 0 &&
    charge === 0 &&
    chord === 0
  ) {
    return null;
  }

  return { notes, peak, scratch, soflan, charge, chord };
}

/** SP難易度表の情報を解決 */
function resolveSpRating(
  songId: string,
  difficulty: Difficulty,
  songs: SpDifficultyTableSongsResponse,
  labels: SpDifficultyTableLabelsResponse,
): SpDifficultyRating | null {
  const songEntry = songs[songId];
  if (!songEntry) return null;

  const tableKey = tableKeyFromDifficulty(difficulty);
  if (!tableKey) return null;

  const rating = songEntry[tableKey];
  if (!rating) return null;

  // -1（未定）、-2（不明）は未設定扱い
  if (rating.n_value < 0 && rating.h_value < 0) return null;

  const normalValue = rating.n_value;
  const hardValue = rating.h_value;
  const normalLabel =
    normalValue < 0
      ? ""
      : (labels.normal[String(normalValue)] ?? String(normalValue));
  const hardLabel =
    hardValue < 0
      ? ""
      : (labels.hard[String(hardValue)] ?? String(hardValue));

  return { normalValue, normalLabel, hardValue, hardLabel };
}

/** DP難易度表の情報を解決 */
function resolveDpRating(
  songId: string,
  difficulty: Difficulty,
  songs: DpDifficultyTableSongsResponse,
): DpDifficultyRating | null {
  const songEntry = songs[songId];
  if (!songEntry) return null;

  const tableKey = tableKeyFromDifficulty(difficulty);
  if (!tableKey) return null;

  const rating = songEntry[tableKey];
  if (!rating) return null;

  return { value: rating.value };
}

/** 生データを譜面データに変換 */
export function transformToChartData(rawData: RawData): ChartData[] {
  const {
    titles, spRadar, dpRadar, chartInfo, labels, songToLabel,
    sp12Songs, sp12Labels, sp11Songs, sp11Labels, dpDifficultySongs,
  } = rawData;
  const charts: ChartData[] = [];

  // すべての楽曲IDを収集
  const songIds = new Set<string>([
    ...Object.keys(titles),
    ...Object.keys(spRadar),
    ...Object.keys(dpRadar),
    ...Object.keys(chartInfo),
  ]);

  for (const songId of songIds) {
    const title = titles[songId] ?? `Unknown (${songId})`;
    const info = chartInfo[songId];
    const spRadarData = spRadar[songId];
    const dpRadarData = dpRadar[songId];
    const songLabel = songToLabel[songId];

    // SP譜面を処理
    for (const difficulty of DIFFICULTIES) {
      const diffIndex = DIFFICULTY_INDEX[difficulty];
      const radar = extractRadar(spRadarData, diffIndex);

      if (radar) {
        const level = info?.level?.sp?.[diffIndex] ?? 0;
        const noteCount = info?.notes?.sp?.[diffIndex] ?? 0;
        const bpm = info?.bpm
          ? formatBpmForDifficulty(info.bpm, "SP", diffIndex)
          : "-";

        // デバッグ: BPMが"-"になる場合のデータを確認
        if (bpm === "-" && info?.bpm) {
          console.debug("BPM debug:", {
            title,
            difficulty,
            diffIndex,
            rawBpm: info.bpm,
            bpmType: typeof info.bpm,
            isArray: Array.isArray(info.bpm),
            length: Array.isArray(info.bpm) ? info.bpm.length : null,
            isBpmPerDifficulty: isBpmPerDifficulty(info.bpm),
          });
        }

        const { labelId, labelName } = resolveLabel(songLabel, difficulty, labels);

        // SP難易度表の紐づけ（対象レベルのみ）
        const sp12Rating =
          level === 12
            ? resolveSpRating(songId, difficulty, sp12Songs, sp12Labels)
            : null;
        const sp11Rating =
          level === 11
            ? resolveSpRating(songId, difficulty, sp11Songs, sp11Labels)
            : null;

        charts.push({
          songId,
          title,
          playMode: "SP" as PlayMode,
          difficulty,
          level,
          noteCount,
          bpm,
          radar,
          inAc: info?.in_ac ?? false,
          inInf: info?.in_inf ?? false,
          labelId,
          labelName,
          sp12Rating,
          sp11Rating,
          dpRating: null,
        });
      }
    }

    // DP譜面を処理
    for (const difficulty of DIFFICULTIES) {
      const diffIndex = DIFFICULTY_INDEX[difficulty];
      const radar = extractRadar(dpRadarData, diffIndex);

      if (radar) {
        const level = info?.level?.dp?.[diffIndex] ?? 0;
        const noteCount = info?.notes?.dp?.[diffIndex] ?? 0;
        const bpm = info?.bpm
          ? formatBpmForDifficulty(info.bpm, "DP", diffIndex)
          : "-";

        const { labelId, labelName } = resolveLabel(songLabel, difficulty, labels);

        // DP難易度表の紐づけ（全レベル）
        const dpRating = resolveDpRating(songId, difficulty, dpDifficultySongs);

        charts.push({
          songId,
          title,
          playMode: "DP" as PlayMode,
          difficulty,
          level,
          noteCount,
          bpm,
          radar,
          inAc: info?.in_ac ?? false,
          inInf: info?.in_inf ?? false,
          labelId,
          labelName,
          sp12Rating: null,
          sp11Rating: null,
          dpRating,
        });
      }
    }
  }

  return charts;
}
