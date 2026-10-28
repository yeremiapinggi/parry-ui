"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { ArchiveIcon, ArrowRightIcon, CopyIcon, GripVerticalIcon, MoreHorizontalIcon, PencilIcon, RotateCcwIcon, Trash2Icon } from "lucide-react"

import { formatCloseDate, formatOpportunityValue } from "@/components/kanban-pipeline-board-data"
import type { Opportunity, PipelineStage } from "@/components/kanban-pipeline-board-types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const priorityClass: Record<Opportunity["priority"], string> = {
  High: "bg-destructive-soft text-destructive",
  Medium: "bg-warning-soft text-warning",
  Low: "bg-secondary text-secondary-foreground",
}

type OpportunityActionsProps = {
  opportunity: Opportunity
  stages: PipelineStage[]
  onMove: (opportunityId: string, stageId: string) => void
  onEdit: (opportunity: Opportunity) => void
  onDuplicate: (opportunity: Opportunity) => void
  onArchive: (opportunity: Opportunity) => void
  onDelete: (opportunity: Opportunity) => void
  onRestore: (opportunity: Opportunity) => void
}

export function OpportunityActions({ opportunity, stages, onMove, onEdit, onDuplicate, onArchive, onDelete, onRestore }: OpportunityActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={`Actions for ${opportunity.name}`} size="icon-sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onEdit(opportunity)}><PencilIcon data-icon="inline-start" />Edit opportunity</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDuplicate(opportunity)}><CopyIcon data-icon="inline-start" />Duplicate</DropdownMenuItem>
          {!opportunity.archived && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger><ArrowRightIcon data-icon="inline-start" />Move to stage</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  {stages.filter((stage) => stage.id !== opportunity.stageId).map((stage) => (
                    <DropdownMenuItem key={stage.id} onSelect={() => onMove(opportunity.id, stage.id)}>{stage.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {opportunity.archived ? (
            <DropdownMenuItem onSelect={() => onRestore(opportunity)}><RotateCcwIcon data-icon="inline-start" />Restore</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => onArchive(opportunity)}><ArchiveIcon data-icon="inline-start" />Archive</DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(opportunity)}><Trash2Icon data-icon="inline-start" />Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type KanbanOpportunityCardProps = OpportunityActionsProps & {
  onOpen: (opportunity: Opportunity) => void
  draggingDisabled?: boolean
  overlay?: boolean
}

export function KanbanOpportunityCard({ opportunity, stages, onMove, onEdit, onDuplicate, onArchive, onDelete, onRestore, onOpen, draggingDisabled = false, overlay = false }: KanbanOpportunityCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
    data: { type: "opportunity", stageId: opportunity.stageId },
    disabled: draggingDisabled || opportunity.archived || overlay,
  })
  const stage = stages.find((candidate) => candidate.id === opportunity.stageId)

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging && !overlay ? 0.35 : 1 }}
      className="group flex flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-xs transition-shadow hover:shadow-sm focus-within:ring-2 focus-within:ring-ring/40"
      data-opportunity-id={opportunity.id}
    >
      <div className="flex items-center justify-between gap-2">
        {!overlay ? (
          <Button
            ref={setActivatorNodeRef}
            aria-label={`Drag ${opportunity.name} to another stage`}
            className="-ml-1 touch-none text-muted-foreground cursor-grab active:cursor-grabbing"
            size="icon-xs"
            variant="ghost"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon />
          </Button>
        ) : <span aria-hidden="true" className="size-6" />}
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Badge className={`px-1.5 py-0 text-[10px] font-medium ${priorityClass[opportunity.priority]}`} variant="secondary">{opportunity.priority}</Badge>
          {opportunity.archived && <Badge variant="outline" className="px-1.5 py-0 text-[10px]">Archived</Badge>}
        </div>
        {!overlay && <OpportunityActions opportunity={opportunity} stages={stages} onMove={onMove} onEdit={onEdit} onDuplicate={onDuplicate} onArchive={onArchive} onDelete={onDelete} onRestore={onRestore} />}
      </div>
      <button
        className="flex flex-col gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onOpen(opportunity)}
        type="button"
      >
        <span className="line-clamp-2 text-sm font-semibold leading-snug">{opportunity.name}</span>
        <span className="truncate text-xs leading-relaxed text-muted-foreground">{opportunity.company}</span>
      </button>
      <div className="flex items-center justify-between gap-2 border-t pt-2">
        <span className="font-data text-sm font-semibold tabular-nums">{formatOpportunityValue(opportunity.value)}</span>
        <div className="flex min-w-0 items-center gap-1.5">
          <Avatar className="size-5"><AvatarFallback className="text-[9px]">{opportunity.ownerInitials}</AvatarFallback></Avatar>
          <span className="max-w-20 truncate text-[11px] text-muted-foreground">{opportunity.owner.split(" ")[0]}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate">Close {formatCloseDate(opportunity.closeDate)}</span>
        <span className="sr-only">Current stage: {stage?.name ?? "Unassigned"}</span>
      </div>
    </article>
  )
}
