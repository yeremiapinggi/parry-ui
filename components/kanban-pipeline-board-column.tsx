"use client"

import { useDroppable } from "@dnd-kit/core"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"

import { formatOpportunityValue } from "@/components/kanban-pipeline-board-data"
import type { Opportunity, PipelineStage } from "@/components/kanban-pipeline-board-types"
import { KanbanOpportunityCard } from "@/components/kanban-opportunity-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type OpportunityCardHandlers = {
  onOpen: (opportunity: Opportunity) => void
  onEdit: (opportunity: Opportunity) => void
  onDuplicate: (opportunity: Opportunity) => void
  onArchive: (opportunity: Opportunity) => void
  onDelete: (opportunity: Opportunity) => void
  onRestore: (opportunity: Opportunity) => void
  onMove: (opportunityId: string, stageId: string) => void
}

type KanbanPipelineColumnProps = OpportunityCardHandlers & {
  stage: PipelineStage
  stages: PipelineStage[]
  opportunities: Opportunity[]
  onAddOpportunity: (stageId: string) => void
  onManageStages: () => void
}

export function KanbanPipelineColumn({ stage, stages, opportunities, onAddOpportunity, onManageStages, ...handlers }: KanbanPipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { type: "stage", stageId: stage.id } })
  const totalValue = opportunities.reduce((sum, opportunity) => sum + opportunity.value, 0)

  return (
    <section
      ref={setNodeRef}
      aria-label={`${stage.name}, ${opportunities.length} opportunities`}
      className={`flex w-[17rem] shrink-0 flex-col rounded-xl border bg-muted/35 transition-colors ${isOver ? "border-primary bg-accent/70 ring-2 ring-ring/30" : "border-border"}`}
      data-stage-id={stage.id}
    >
      <header className="flex items-start justify-between gap-2 border-b px-3 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${stage.terminal === "won" ? "bg-success" : stage.terminal === "lost" ? "bg-muted-foreground" : "bg-info"}`} aria-hidden="true" />
            <h3 className="truncate text-sm font-semibold">{stage.name}</h3>
            <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">{opportunities.length}</span>
          </div>
          <p className="mt-1 pl-4 font-data text-xs tabular-nums text-muted-foreground">{formatOpportunityValue(totalValue)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label={`Actions for ${stage.name}`} size="icon-sm" variant="ghost"><MoreHorizontalIcon /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => onAddOpportunity(stage.id)}><PlusIcon data-icon="inline-start" />Add opportunity</DropdownMenuItem>
              <DropdownMenuItem onSelect={onManageStages}>Manage stages</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex min-h-40 flex-1 flex-col gap-2 p-2">
        {opportunities.length ? (
          opportunities.map((opportunity) => (
            <KanbanOpportunityCard key={opportunity.id} opportunity={opportunity} stages={stages} {...handlers} />
          ))
        ) : (
          <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-background/40 px-3 py-5 text-center">
            <p className="text-xs text-muted-foreground">No opportunities in this stage</p>
            <Button size="xs" variant="ghost" onClick={() => onAddOpportunity(stage.id)}><PlusIcon data-icon="inline-start" />Add card</Button>
          </div>
        )}
        {opportunities.length > 0 && (
          <Button className="mt-1 w-full justify-start text-muted-foreground" size="sm" variant="ghost" onClick={() => onAddOpportunity(stage.id)}>
            <PlusIcon data-icon="inline-start" />Add card
          </Button>
        )}
      </div>
    </section>
  )
}
