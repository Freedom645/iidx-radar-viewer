/** プレイモード */
export type PlayMode = "SP" | "DP";

/** 難易度 */
export type Difficulty =
  | "BEGINNER"
  | "NORMAL"
  | "HYPER"
  | "ANOTHER"
  | "LEGGENDARIA";

/** 難易度インデックス（配列のインデックスに対応） */
export const DIFFICULTY_INDEX: Record<Difficulty, number> = {
  BEGINNER: 0,
  NORMAL: 1,
  HYPER: 2,
  ANOTHER: 3,
  LEGGENDARIA: 4,
} as const;

/** 難易度の配列（表示順） */
export const DIFFICULTIES: Difficulty[] = [
  "BEGINNER",
  "NORMAL",
  "HYPER",
  "ANOTHER",
  "LEGGENDARIA",
];

/** 難易度の略称 */
export const DIFFICULTY_SHORT: Record<PlayMode, Record<Difficulty, string>> = {
  SP: {
    BEGINNER: "SPB",
    NORMAL: "SPN",
    HYPER: "SPH",
    ANOTHER: "SPA",
    LEGGENDARIA: "SPL",
  },
  DP: {
    BEGINNER: "DPB",
    NORMAL: "DPN",
    HYPER: "DPH",
    ANOTHER: "DPA",
    LEGGENDARIA: "DPL",
  },
};

/** レーダ種別 */
export type RadarType =
  | "NOTES"
  | "PEAK"
  | "SCRATCH"
  | "SOFLAN"
  | "CHARGE"
  | "CHORD";

/** レーダ種別の配列（表示順） */
export const RADAR_TYPES: RadarType[] = [
  "NOTES",
  "PEAK",
  "SCRATCH",
  "SOFLAN",
  "CHARGE",
  "CHORD",
];

/** APIレスポンス: 楽曲名 */
export type TitleResponse = Record<string, string>;

/** APIレスポンス: レーダ値（難易度別配列） */
export type RadarValues = [number, number, number, number, number];

/** APIレスポンス: レーダデータ */
export type RadarResponse = Record<string, Record<RadarType, RadarValues>>;

/** BPM値のAPIレスポンス型 */
export type BPMValueResponse = number | number[];
/** 難易度別BPM値のAPIレスポンス型 */
export type BPMPerDifficultyResponse = {
  sp: [
    BPMValueResponse,
    BPMValueResponse,
    BPMValueResponse,
    BPMValueResponse,
    BPMValueResponse,
  ];
  dp: [
    BPMValueResponse,
    BPMValueResponse,
    BPMValueResponse,
    BPMValueResponse,
    BPMValueResponse,
  ];
};
/** APIレスポンス: BPMデータ */
export type BpmResponse = BPMValueResponse | BPMPerDifficultyResponse;

/** APIレスポンス: 譜面情報 */
export interface ChartInfoResponse {
  [songId: string]: {
    bpm: BpmResponse;
    level: {
      sp: [number, number, number, number, number];
      dp: [number, number, number, number, number];
    };
    notes: {
      sp: [number, number, number, number, number];
      dp: [number, number, number, number, number];
    };
    in_ac: boolean;
    in_inf: boolean;
  };
}

/** レーダ値 */
export interface RadarData {
  notes: number;
  peak: number;
  scratch: number;
  soflan: number;
  charge: number;
  chord: number;
}

/** 譜面データ（1譜面分） */
export interface ChartData {
  /** 楽曲ID */
  songId: string;
  /** 楽曲名 */
  title: string;
  /** プレイモード */
  playMode: PlayMode;
  /** 難易度 */
  difficulty: Difficulty;
  /** レベル */
  level: number;
  /** ノーツ数 */
  noteCount: number;
  /** BPM（文字列表現） */
  bpm: string;
  /** レーダ値 */
  radar: RadarData;
}

/** BPM値の型 */
export type BpmValue = BPMValueResponse | BPMPerDifficultyResponse;

/** 単一のBPM値（数値または[min,max]配列）を文字列に変換 */
function formatSingleBpm(bpm: number | number[]): string {
  if (typeof bpm === "number") {
    return String(bpm);
  }
  if (Array.isArray(bpm) && bpm.length >= 2) {
    const min = Math.min(...bpm);
    const max = Math.max(...bpm);
    if (min === max) {
      return String(min);
    }
    return `${min}-${max}`;
  }
  return String(bpm);
}

/** BPMが難易度別配列かどうかを判定 */
export function isBpmPerDifficulty(
  bpm: BpmValue,
): bpm is BPMPerDifficultyResponse {
  return (
    typeof bpm === "object" &&
    "sp" in bpm &&
    Array.isArray(bpm.sp) &&
    bpm.sp.length === 5 &&
    bpm.sp.every((v) => typeof v === "number" || Array.isArray(v)) &&
    "dp" in bpm &&
    Array.isArray(bpm.dp) &&
    bpm.dp.length === 5 &&
    bpm.dp.every((v) => typeof v === "number" || Array.isArray(v))
  );
}

/** 難易度別のBPMを取得して文字列に変換 */
export function formatBpmForDifficulty(
  bpm: BpmValue,
  playMode: PlayMode,
  difficultyIndex: number,
): string {
  if (typeof bpm === "number") {
    return String(bpm);
  }

  // 難易度別BPM（5要素配列）の場合
  if (isBpmPerDifficulty(bpm)) {
    const diffBpm =
      bpm[playMode.toLocaleLowerCase() as "sp" | "dp"][difficultyIndex];
    if (diffBpm !== undefined) {
      return formatSingleBpm(diffBpm);
    }
  }

  if (Array.isArray(bpm)) {
    // [min, max] 形式の場合（2要素で両方数値）
    if (bpm.length === 2 && bpm.every((v) => typeof v === "number")) {
      return formatSingleBpm(bpm as number[]);
    }

    // その他の配列（フォールバック：全体の範囲を表示）
    const flatten = (arr: (number | number[])[]): number[] => {
      return arr.flatMap((v) => (Array.isArray(v) ? v : [v]));
    };
    const values = flatten(bpm);
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (min === max) {
        return String(min);
      }
      return `${min}-${max}`;
    }
  }

  return "-";
}
