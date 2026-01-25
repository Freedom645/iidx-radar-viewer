import type {
  ChartData,
  ChartInfoResponse,
  PlayMode,
  RadarData,
  RadarResponse,
  TitleResponse,
} from "@/types";
import {
  DIFFICULTIES,
  DIFFICULTY_INDEX,
  formatBpmForDifficulty,
  isBpmPerDifficulty,
} from "@/types";

interface RawData {
  titles: TitleResponse;
  spRadar: RadarResponse;
  dpRadar: RadarResponse;
  chartInfo: ChartInfoResponse;
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

/** 生データを譜面データに変換 */
export function transformToChartData(rawData: RawData): ChartData[] {
  const { titles, spRadar, dpRadar, chartInfo } = rawData;
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

        charts.push({
          songId,
          title,
          playMode: "SP" as PlayMode,
          difficulty,
          level,
          noteCount,
          bpm,
          radar,
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

        charts.push({
          songId,
          title,
          playMode: "DP" as PlayMode,
          difficulty,
          level,
          noteCount,
          bpm,
          radar,
        });
      }
    }
  }

  return charts;
}
