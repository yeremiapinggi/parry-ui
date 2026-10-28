import { Badge } from "@/components/ui/badge"

const miniColumns = [
  { name: "New Lead", count: "2", cards: [["Customer data platform", "Northstar Labs", "$48k"], ["Service desk expansion", "Lattice Health", "$32k"]] },
  { name: "Qualified", count: "2", cards: [["Regional analytics", "Meridian Works", "$76k"], ["Workflow automation", "Redwood Freight", "$54k"]] },
  { name: "Proposal", count: "2", cards: [["Enterprise support", "Horizon Group", "$68k"], ["AI operations pilot", "Saffron Digital", "$92k"]] },
]

export function KanbanPipelineBoardThumbnail() {
  return (
    <div aria-hidden="true" className="font-data flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <span className="block truncate font-heading text-xs font-semibold sm:text-sm">Sales Pipeline</span>
          <span className="text-[9px] text-muted-foreground sm:text-[10px]">10 opportunities · $473,500 open pipeline</span>
        </div>
        <span className="shrink-0 rounded-md bg-primary px-2 py-1 text-[8px] font-medium text-primary-foreground sm:text-[9px]">+ Add</span>
      </div>
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <span className="flex h-6 min-w-0 flex-1 items-center rounded-md border bg-card px-2 text-[8px] text-muted-foreground sm:text-[9px]">Search opportunities</span>
        <span className="rounded-md border bg-card px-2 py-1 text-[8px] text-muted-foreground sm:text-[9px]">Owner</span>
        <span className="hidden rounded-md border bg-card px-2 py-1 text-[8px] text-muted-foreground md:inline">Priority</span>
      </div>
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden p-2.5 sm:gap-2.5 sm:p-3">
        {miniColumns.map((column, columnIndex) => (
          <div key={column.name} className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-md border bg-muted/35">
            <div className="flex items-center justify-between border-b px-2 py-1.5">
              <span className="truncate text-[8px] font-semibold sm:text-[9px]">{column.name}</span>
              <Badge variant="secondary" className="h-4 px-1 text-[7px]">{column.count}</Badge>
            </div>
            <div className="flex flex-col gap-1.5 p-1.5">
              {column.cards.slice(0, columnIndex === 2 ? 1 : 2).map(([name, company, value]) => (
                <div key={name} className="rounded border bg-card p-1.5 shadow-xs">
                  <span className="mb-0.5 block truncate text-[7px] font-medium leading-tight sm:text-[8px]">{name}</span>
                  <span className="block truncate text-[6px] text-muted-foreground sm:text-[7px]">{company}</span>
                  <span className="mt-1 block font-data text-[7px] font-semibold sm:text-[8px]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
