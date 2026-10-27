"use client"

import { useMemo, useState } from "react"
import { ArrowDownIcon, ArrowDownUpIcon, ArrowUpIcon } from "lucide-react"

import type { ChannelSummary } from "@/lib/analytics-dashboard-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SortKey = "name" | "activity" | "share" | "completionRate" | "averageResponseSeconds"
type SortDirection = "ascending" | "descending"

const sortLabels: Record<SortKey, string> = {
  name: "Channel",
  activity: "Activity",
  share: "Share",
  completionRate: "Completion rate",
  averageResponseSeconds: "Avg. response",
}

function SortButton({
  sortKey,
  currentKey,
  direction,
  onSort,
}: {
  sortKey: SortKey
  currentKey: SortKey
  direction: SortDirection
  onSort: (key: SortKey) => void
}) {
  const active = currentKey === sortKey
  const Icon = active ? direction === "ascending" ? ArrowUpIcon : ArrowDownIcon : ArrowDownUpIcon

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 px-2 font-medium"
      aria-label={`Sort by ${sortLabels[sortKey]}${active ? `, currently ${direction}` : ""}`}
      onClick={() => onSort(sortKey)}
    >
      {sortLabels[sortKey]}
      <Icon data-icon="inline-end" />
    </Button>
  )
}

export function AnalyticsBreakdownTable({ data }: { data: ChannelSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("activity")
  const [direction, setDirection] = useState<SortDirection>("descending")

  const sortedRows = useMemo(() => {
    const sign = direction === "ascending" ? 1 : -1
    return [...data].sort((first, second) => {
      const firstValue = first[sortKey]
      const secondValue = second[sortKey]
      if (typeof firstValue === "string" && typeof secondValue === "string") {
        return sign * firstValue.localeCompare(secondValue)
      }
      return sign * (Number(firstValue) - Number(secondValue))
    })
  }, [data, direction, sortKey])

  function changeSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((current) => current === "ascending" ? "descending" : "ascending")
      return
    }
    setSortKey(key)
    setDirection(key === "name" ? "ascending" : "descending")
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 px-5 py-4">
        <CardTitle className="text-base">Channel Performance</CardTitle>
        <CardDescription>Sort columns to compare channel efficiency and response time.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3 sm:px-5">
        <Table>
          <caption className="sr-only">Performance breakdown by channel for the selected date range.</caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col"><SortButton sortKey="name" currentKey={sortKey} direction={direction} onSort={changeSort} /></TableHead>
              <TableHead scope="col" className="text-right"><SortButton sortKey="activity" currentKey={sortKey} direction={direction} onSort={changeSort} /></TableHead>
              <TableHead scope="col" className="hidden text-right sm:table-cell"><SortButton sortKey="share" currentKey={sortKey} direction={direction} onSort={changeSort} /></TableHead>
              <TableHead scope="col" className="hidden text-right md:table-cell"><SortButton sortKey="completionRate" currentKey={sortKey} direction={direction} onSort={changeSort} /></TableHead>
              <TableHead scope="col" className="text-right"><SortButton sortKey="averageResponseSeconds" currentKey={sortKey} direction={direction} onSort={changeSort} /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.activity.toLocaleString("en-US")}</TableCell>
                <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">{(row.share * 100).toFixed(1)}%</TableCell>
                <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">{row.completionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.averageResponseSeconds.toFixed(1)}s</TableCell>
              </TableRow>
            ))}
            {sortedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No channel performance data for this range.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
