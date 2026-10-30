"use client"

import * as React from "react"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludesSome,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Client-side sorting, global search, column filters, visibility, selection and pagination (TanStack Table v9).
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString, arrIncludesSome: filterFn_arrIncludesSome },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
  columnVisibilityFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

type DataTableFeatures = typeof dataTableFeatures
type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>
type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>

function DataTable<TData extends RowData>({
  columns,
  data,
  pageSize = 10,
  toolbar,
  emptyText = "No results.",
  className,
}: {
  // Keep `columns` and `data` stable (module scope or memo); new arrays rebuild every row model.
  columns: DataTableColumnDef<TData>[]
  data: TData[]
  pageSize?: number
  toolbar?: (table: DataTableInstance<TData>) => React.ReactNode
  emptyText?: React.ReactNode
  className?: string
}) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    globalFilterFn: "includesString",
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })
  const rows = table.getRowModel().rows
  const selected = table.getFilteredSelectedRowModel().rows.length
  const total = table.getFilteredRowModel().rows.length

  return (
    <div data-slot="data-table" className={cn("flex w-full flex-col gap-3", className)}>
      {toolbar?.(table)}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{selected > 0 ? `${selected} of ${total} selected` : `${total} rows`}</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            Page {table.state.pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Header button that cycles the column's sort. TanStack picks the first direction (descending for numbers).
function DataTableColumnHeader<TData extends RowData>({
  column,
  title,
}: {
  column: Column<DataTableFeatures, TData, unknown>
  title: string
}) {
  if (!column.getCanSort()) return <span>{title}</span>
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon

  return (
    <Button variant="ghost" size="sm" className="-ml-2.5" onClick={column.getToggleSortingHandler()}>
      {title}
      <Icon className={cn(!sorted && "text-muted-foreground")} />
    </Button>
  )
}

export { DataTable, DataTableColumnHeader, dataTableFeatures, type DataTableColumnDef, type DataTableInstance }
