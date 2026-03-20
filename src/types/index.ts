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

/** CPIクリアタイプ */
export type CpiClearType = "easy" | "normal" | "hard" | "exh" | "fc";

/** CPIクリアタイプの配列（表示順） */
export const CPI_CLEAR_TYPES: CpiClearType[] = [
  "easy",
  "normal",
  "hard",
  "exh",
  "fc",
];

/** CPIクリアタイプの表示ラベル */
export const CPI_CLEAR_TYPE_LABELS: Record<CpiClearType, string> = {
  easy: "EASY",
  normal: "NORMAL",
  hard: "HARD",
  exh: "EX HARD",
  fc: "FC",
};

/** CPIクリアタイプとJSONキーの対応 */
const CPI_JSON_KEY: Record<CpiClearType, string> = {
  easy: "easy",
  normal: "clear",
  hard: "hard",
  exh: "exh",
  fc: "fc",
};

/** CPIクリアタイプからJSONキーに変換 */
export function cpiJsonKey(clearType: CpiClearType): string {
  return CPI_JSON_KEY[clearType];
}

/** CPI値（5種類のクリアタイプ別） */
export interface CpiData {
  easy: number | null;
  normal: number | null;
  hard: number | null;
  exh: number | null;
  fc: number | null;
}

/** APIレスポンス: CPI値の個別エントリ */
export interface CpiEntryResponse {
  cpi_value: number;
  kojinsa_value: number;
}

/** APIレスポンス: CPI難易度別データ */
export interface CpiDifficultyResponse {
  easy?: CpiEntryResponse;
  clear?: CpiEntryResponse;
  hard?: CpiEntryResponse;
  exh?: CpiEntryResponse;
  fc?: CpiEntryResponse;
}

/** APIレスポンス: CPIデータ */
export type CpiResponse = Record<
  string,
  {
    A?: CpiDifficultyResponse;
    H?: CpiDifficultyResponse;
    L?: CpiDifficultyResponse;
    cpi_id: string;
  }
>;

/** AC/INFINITAS収録状況フィルター */
export type VersionFilter = "all" | "ac" | "inf";

/** 難易度表キー */
export type DifficultyTableKey = "A" | "H" | "L";

/** Difficultyから難易度表キー(A/H/L)への変換マップ */
const DIFFICULTY_TO_TABLE_KEY: Partial<Record<Difficulty, DifficultyTableKey>> = {
  ANOTHER: "A",
  HYPER: "H",
  LEGGENDARIA: "L",
};

/** Difficultyを難易度表キー(A/H/L)に変換。対象外の場合はundefined */
export function tableKeyFromDifficulty(
  difficulty: Difficulty,
): DifficultyTableKey | undefined {
  return DIFFICULTY_TO_TABLE_KEY[difficulty];
}

/** APIレスポンス: SP難易度表の譜面データ */
export type SpDifficultyTableSongsResponse = Record<
  string,
  Record<string, { n_value: number; h_value: number }>
>;

/** APIレスポンス: SP難易度表のラベル定義 */
export type SpDifficultyTableLabelsResponse = {
  hard: Record<string, string>;
  normal: Record<string, string>;
};

/** APIレスポンス: DP難易度表の譜面データ */
export type DpDifficultyTableSongsResponse = Record<
  string,
  Record<string, { value: number; snj_id: string }>
>;

/** SP難易度表の難易度情報 */
export interface SpDifficultyRating {
  /** ノーマル難易度値（キー値） */
  normalValue: number;
  /** ノーマル難易度ラベル */
  normalLabel: string;
  /** ハード難易度値（キー値） */
  hardValue: number;
  /** ハード難易度ラベル */
  hardLabel: string;
}

/** DP難易度表の難易度情報 */
export interface DpDifficultyRating {
  /** 難易度値 */
  value: number;
}

/** APIレスポンス: パック名一覧（インデックスがlabel ID） */
export type LabelResponse = string[];

/** APIレスポンス: 楽曲とパックの紐づけ */
export type SongToLabelResponse = Record<
  string,
  {
    in_leggendaria: boolean;
    label: number;
  }
>;

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
  /** AC収録 */
  inAc: boolean;
  /** INFINITAS収録 */
  inInf: boolean;
  /** パックID（INFINITAS未収録の場合はnull） */
  labelId: number | null;
  /** パック名（INFINITAS未収録の場合はnull） */
  labelName: string | null;
  /** SP☆12難易度表 */
  sp12Rating: SpDifficultyRating | null;
  /** SP☆11難易度表 */
  sp11Rating: SpDifficultyRating | null;
  /** DP難易度表 */
  dpRating: DpDifficultyRating | null;
  /** CPI値（SP☆12のみ） */
  cpi: CpiData | null;
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
