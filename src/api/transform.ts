import type {
  ChartData,
  ChartInfoResponse,
  CpiData,
  CpiResponse,
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
  CPI_CLEAR_TYPES,
  cpiJsonKey,
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
  cpiData: CpiResponse;
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

/** CPI値を解決 */
function resolveCpi(
  songId: string,
  difficulty: Difficulty,
  level: number,
  cpiData: CpiResponse,
): CpiData | null {
  // SP☆12のみが対象
  if (level !== 12) return null;

  const songEntry = cpiData[songId];
  if (!songEntry) return null;

  const tableKey = tableKeyFromDifficulty(difficulty);
  if (!tableKey) return null;

  const diffEntry = songEntry[tableKey];
  if (!diffEntry) return null;

  const result: CpiData = { easy: null, normal: null, hard: null, exh: null, fc: null };
  let hasValue = false;

  for (const clearType of CPI_CLEAR_TYPES) {
    const jsonKey = cpiJsonKey(clearType);
    const entry = diffEntry[jsonKey as keyof typeof diffEntry];
    if (entry && typeof entry === "object" && "cpi_value" in entry) {
      const value = entry.cpi_value;
      // -2は未設定
      if (value !== -2) {
        result[clearType] = value;
        hasValue = true;
      }
    }
  }

  return hasValue ? result : null;
}

/** 生データを譜面データに変換 */
export function transformToChartData(rawData: RawData): ChartData[] {
  const {
    titles, spRadar, dpRadar, chartInfo, labels, songToLabel,
    sp12Songs, sp12Labels, sp11Songs, sp11Labels, dpDifficultySongs, cpiData,
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

        // CPI値の紐づけ（SP☆12のみ）
        const cpi = resolveCpi(songId, difficulty, level, cpiData);

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
          cpi,
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
          cpi: null,
        });
      }
    }
  }

  return charts;
}
