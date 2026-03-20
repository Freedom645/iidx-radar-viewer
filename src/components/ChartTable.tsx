import { useMemo, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ChartData, Difficulty, PlayMode } from '@/types'
import { DIFFICULTY_SHORT } from '@/types'
import { useColumnStore, useSortStore, type ColumnId } from '@/stores'

interface ChartTableProps {
  data: ChartData[]
  playMode: PlayMode
}

const DIFFICULTY_BG_COLORS: Record<Difficulty, string> = {
  BEGINNER: 'bg-green-200',
  NORMAL: 'bg-sky-200',
  HYPER: 'bg-yellow-200',
  ANOTHER: 'bg-red-200',
  LEGGENDARIA: 'bg-purple-200',
}

const ROW_HEIGHT = 41

const columnHelper = createColumnHelper<ChartData>()

export function ChartTable({ data, playMode }: ChartTableProps) {
  const { sorting, setSorting } = useSortStore()
  const { visibleColumns } = useColumnStore()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        id: 'title',
        header: '楽曲名',
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        size: 250,
        minSize: 250,
        maxSize: 250,
      }),
      columnHelper.accessor('difficulty', {
        id: 'difficulty',
        header: '難易度',
        cell: (info) => {
          const difficulty = info.getValue()
          return (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_BG_COLORS[difficulty]}`}
            >
              {DIFFICULTY_SHORT[playMode][difficulty]}
            </span>
          )
        },
        size: 70,
        minSize: 70,
        maxSize: 70,
      }),
      columnHelper.accessor('level', {
        id: 'level',
        header: 'Lv',
        cell: (info) => info.getValue(),
        size: 50,
        minSize: 50,
        maxSize: 50,
      }),
      columnHelper.accessor('bpm', {
        id: 'bpm',
        header: 'BPM',
        cell: (info) => info.getValue(),
        size: 80,
        minSize: 80,
        maxSize: 80,
      }),
      columnHelper.accessor('noteCount', {
        id: 'noteCount',
        header: '総ノーツ数',
        cell: (info) => info.getValue().toLocaleString(),
        size: 70,
        minSize: 70,
        maxSize: 70,
      }),
      columnHelper.accessor('radar.notes', {
        id: 'notes',
        header: 'NOTES',
        cell: (info) => info.getValue().toFixed(2),
        size: 70,
        minSize: 70,
        maxSize: 70,
      }),
      columnHelper.accessor('radar.peak', {
        id: 'peak',
        header: 'PEAK',
        cell: (info) => info.getValue().toFixed(2),
        size: 70,
        minSize: 70,
        maxSize: 70,
      }),
      columnHelper.accessor('radar.scratch', {
        id: 'scratch',
        header: 'SCRATCH',
        cell: (info) => info.getValue().toFixed(2),
        size: 80,
        minSize: 80,
        maxSize: 80,
      }),
      columnHelper.accessor('radar.soflan', {
        id: 'soflan',
        header: 'SOF-LAN',
        cell: (info) => info.getValue().toFixed(2),
        size: 80,
        minSize: 80,
        maxSize: 80,
      }),
      columnHelper.accessor('radar.charge', {
        id: 'charge',
        header: 'CHARGE',
        cell: (info) => info.getValue().toFixed(2),
        size: 80,
        minSize: 80,
        maxSize: 80,
      }),
      columnHelper.accessor('radar.chord', {
        id: 'chord',
        header: 'CHORD',
        cell: (info) => info.getValue().toFixed(2),
        size: 70,
        minSize: 70,
        maxSize: 70,
      }),
      ...(playMode === 'SP'
        ? [
            columnHelper.display({
              id: 'spNormal',
              header: 'ノーマル難易度',
              cell: (info) => {
                const rating = info.row.original.sp12Rating ?? info.row.original.sp11Rating
                return rating?.normalLabel ?? ''
              },
              sortingFn: (rowA, rowB) => {
                const ratingA = rowA.original.sp12Rating ?? rowA.original.sp11Rating
                const ratingB = rowB.original.sp12Rating ?? rowB.original.sp11Rating
                const a = ratingA?.normalValue ?? null
                const b = ratingB?.normalValue ?? null
                if (a === null && b === null) return 0
                if (a === null) return 1
                if (b === null) return -1
                if (a < 0 && b < 0) return 0
                if (a < 0) return 1
                if (b < 0) return -1
                return a - b
              },
              size: 100,
              minSize: 100,
              maxSize: 100,
              enableSorting: true,
            }),
            columnHelper.display({
              id: 'spHard',
              header: 'ハード難易度',
              cell: (info) => {
                const rating = info.row.original.sp12Rating ?? info.row.original.sp11Rating
                return rating?.hardLabel ?? ''
              },
              sortingFn: (rowA, rowB) => {
                const ratingA = rowA.original.sp12Rating ?? rowA.original.sp11Rating
                const ratingB = rowB.original.sp12Rating ?? rowB.original.sp11Rating
                const a = ratingA?.hardValue ?? null
                const b = ratingB?.hardValue ?? null
                if (a === null && b === null) return 0
                if (a === null) return 1
                if (b === null) return -1
                if (a < 0 && b < 0) return 0
                if (a < 0) return 1
                if (b < 0) return -1
                return a - b
              },
              size: 100,
              minSize: 100,
              maxSize: 100,
              enableSorting: true,
            }),
          ]
        : [
            columnHelper.display({
              id: 'dpDifficulty',
              header: 'DP難易度',
              cell: (info) => {
                const rating = info.row.original.dpRating
                return rating ? rating.value.toFixed(1) : ''
              },
              sortingFn: (rowA, rowB) => {
                const a = rowA.original.dpRating?.value ?? null
                const b = rowB.original.dpRating?.value ?? null
                if (a === null && b === null) return 0
                if (a === null) return 1
                if (b === null) return -1
                return a - b
              },
              size: 80,
              minSize: 80,
              maxSize: 80,
              enableSorting: true,
            }),
          ]),
    ],
    [playMode]
  )

  const visibleColumnsList = useMemo(
    () => columns.filter((col) => visibleColumns.has(col.id as ColumnId)),
    [columns, visibleColumns]
  )

  const table = useReactTable({
    data,
    columns: visibleColumnsList,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0

  if (rows.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-gray-500">
        条件に一致する譜面がありません
      </div>
    )
  }

  return (
    <div
      ref={tableContainerRef}
      className="overflow-auto"
      style={{ height: 'calc(100vh - 350px)', minHeight: '400px' }}
    >
      <table className="w-full divide-y divide-gray-200 table-fixed">
        <colgroup>
          {table.getAllLeafColumns().map((column) => (
            <col key={column.id} style={{ width: column.getSize() }} />
          ))}
        </colgroup>
        <thead className="bg-gray-50 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none bg-gray-50"
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? ''}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <tr
                key={row.id}
                className="hover:bg-gray-50"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
