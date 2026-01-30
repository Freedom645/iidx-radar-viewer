# IIDX Radar Viewer

beatmania IIDX の譜面別レーダー値を一覧・検索できる非公式ビューアです。

https://freedom645.github.io/iidx-radar-viewer/

## 機能

- **譜面別レーダー値一覧表示** - SP/DP・難易度別にNOTES、PEAK、SCRATCH、SOF-LAN、CHARGE、CHORDのレーダー値を表示
- **フィルタ機能** - 楽曲名、難易度、レベル、BPM、総ノーツ数、各レーダー値で絞り込み
- **ソート機能** - 各カラムでソート可能
- **統計情報表示** - 検索結果の平均・中央値・最小・最大を表示
- **検索条件の保存** - フィルタ・ソート条件をLocalStorageに保存し、次回アクセス時に復元
- **カラム表示設定** - 表示するカラムをカスタマイズ可能

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| テーブル | TanStack Table + TanStack Virtual |
| データ取得 | axios |
| 状態管理 | Zustand |

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## データソース

譜面情報およびレーダー値は [IIDX-Data-Table](https://chinimuruhi.github.io/IIDX-Data-Table/) で公開されている情報を利用しています。

## デプロイ

GitHub Actions により `main` ブランチへのpush時に GitHub Pages へ自動デプロイされます。
