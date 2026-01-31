import { useMemo, useState } from 'react'
import type { ChartData } from '@/types'

interface StatsPanelProps {
  data: ChartData[]
}

interface Stats {
  mean: number
  median: number
  min: number
  max: number
}

function calcStats(values: number[]): Stats | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mid = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  return {
    mean: sum / sorted.length,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
}

function formatStat(value: number, isInteger: boolean): string {
  return isInteger ? Math.round(value).toLocaleString() : value.toFixed(2)
}

export function StatsPanel({ data }: StatsPanelProps) {
  const [expanded, setExpanded] = useState(false)

  const stats = useMemo(() => {
    if (data.length === 0) return null

    const noteCountStats = calcStats(data.map((d) => d.noteCount))
    const notesStats = calcStats(data.map((d) => d.radar.notes))
    const peakStats = calcStats(data.map((d) => d.radar.peak))
    const scratchStats = calcStats(data.map((d) => d.radar.scratch))
    const soflanStats = calcStats(data.map((d) => d.radar.soflan))
    const chargeStats = calcStats(data.map((d) => d.radar.charge))
    const chordStats = calcStats(data.map((d) => d.radar.chord))

    return {
      noteCount: noteCountStats,
      notes: notesStats,
      peak: peakStats,
      scratch: scratchStats,
      soflan: soflanStats,
      charge: chargeStats,
      chord: chordStats,
    }
  }, [data])

  if (!stats) return null

  const rows: { label: string; stats: Stats | null; isInteger: boolean }[] = [
    { label: '総ノーツ数', stats: stats.noteCount, isInteger: true },
    { label: 'NOTES', stats: stats.notes, isInteger: false },
    { label: 'PEAK', stats: stats.peak, isInteger: false },
    { label: 'SCRATCH', stats: stats.scratch, isInteger: false },
    { label: 'SOF-LAN', stats: stats.soflan, isInteger: false },
    { label: 'CHARGE', stats: stats.charge, isInteger: false },
    { label: 'CHORD', stats: stats.chord, isInteger: false },
  ]

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        <span>統計情報</span>
      </button>
      {expanded && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 pr-4">項目</th>
                <th className="pb-2 pr-4 text-right">平均</th>
                <th className="pb-2 pr-4 text-right">中央値</th>
                <th className="pb-2 pr-4 text-right">最小</th>
                <th className="pb-2 text-right">最大</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                (row) =>
                  row.stats && (
                    <tr key={row.label} className="border-b border-gray-100">
                      <td className="py-1.5 pr-4 font-medium text-gray-700">
                        {row.label}
                      </td>
                      <td className="py-1.5 pr-4 text-right text-gray-600">
                        {formatStat(row.stats.mean, row.isInteger)}
                      </td>
                      <td className="py-1.5 pr-4 text-right text-gray-600">
                        {formatStat(row.stats.median, row.isInteger)}
                      </td>
                      <td className="py-1.5 pr-4 text-right text-gray-600">
                        {formatStat(row.stats.min, row.isInteger)}
                      </td>
                      <td className="py-1.5 text-right text-gray-600">
                        {formatStat(row.stats.max, row.isInteger)}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
