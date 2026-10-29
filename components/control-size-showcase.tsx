"use client"

import { useState, type ReactNode } from "react"
import { ChevronDownIcon } from "lucide-react"

import { WorkspaceSwitcher, demoWorkspaces } from "@/components/application-shell-navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { controlIconSizeClasses, type ControlSize } from "@/components/ui/control-size"

const sizeRows: { size: ControlSize; label: string }[] = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
]

export function ControlSizeShowcase() {
  const [workspace, setWorkspace] = useState<string>(demoWorkspaces[0])
  const [showcasePopoverOpen, setShowcasePopoverOpen] = useState(true)

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold">Shared control sizes</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Select, popover, and workspace triggers share the same height, type scale, padding, icon scale, and radius. Width stays context-specific.
          </p>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="grid min-w-[42rem] grid-cols-[5rem_repeat(3,minmax(0,1fr))] items-center gap-x-3 gap-y-3">
            <span className="text-xs font-medium text-muted-foreground">Size</span>
            <span className="text-xs font-medium text-muted-foreground">Select</span>
            <span className="text-xs font-medium text-muted-foreground">Popover trigger</span>
            <span className="text-xs font-medium text-muted-foreground">Workspace</span>
            {sizeRows.map(({ size, label }) => (
              <SizeRow key={size} size={size} label={label} workspace={workspace} onWorkspaceChange={setWorkspace} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold">Control states</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The open popover is interactive; hover and focus styles are shown alongside disabled and invalid controls.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StateTile label="Closed">
            <Select defaultValue="active">
              <SelectTrigger size="md" aria-label="Closed state preview" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </StateTile>
          <StateTile label="Hover">
            <Button type="button" variant="outline" controlSize="md" className="w-full bg-muted hover:bg-muted">
              Hover preview
            </Button>
          </StateTile>
          <StateTile label="Focus">
            <Button type="button" variant="outline" controlSize="md" className="w-full border-ring ring-3 ring-ring/50">
              Focus preview
            </Button>
          </StateTile>
          <StateTile label="Disabled">
            <Button type="button" variant="outline" controlSize="md" disabled className="w-full">
              Unavailable
            </Button>
          </StateTile>
          <StateTile label="Error">
            <Select defaultValue="invalid">
              <SelectTrigger size="md" aria-label="Invalid state preview" aria-invalid className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="invalid">Invalid value</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </StateTile>
          <StateTile label="Open">
            <Popover open={showcasePopoverOpen} onOpenChange={setShowcasePopoverOpen}>
              <PopoverTrigger controlSize="md" aria-label="Open state preview" className="w-full">
                <span>Open details</span>
                <ChevronDownIcon aria-hidden="true" className={controlIconSizeClasses.md} />
              </PopoverTrigger>
              <PopoverContent widthMode="match-trigger" align="start" className="p-3">
                <p className="text-sm font-medium">Popover is open</p>
                <p className="text-xs text-muted-foreground">The content tracks the trigger width.</p>
              </PopoverContent>
            </Popover>
          </StateTile>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold">Popover content widths</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Choose a width behavior independently from the trigger size.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <PopoverWidthExample label="Match trigger" widthMode="match-trigger" />
          <PopoverWidthExample label="Auto width" widthMode="auto" />
          <PopoverWidthExample label="Custom wide" widthMode="custom" />
        </div>
      </div>
    </div>
  )
}

function SizeRow({
  size,
  label,
  workspace,
  onWorkspaceChange,
}: {
  size: ControlSize
  label: string
  workspace: string
  onWorkspaceChange: (value: string) => void
}) {
  return (
    <>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select defaultValue="active">
        <SelectTrigger size={size} aria-label={`${label} select`} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger controlSize={size} aria-label={`${label} filter popover`} className="w-full">
          <span>Status</span>
          <ChevronDownIcon aria-hidden="true" className={controlIconSizeClasses[size]} />
        </PopoverTrigger>
        <PopoverContent widthMode="match-trigger" align="start" className="p-3">
          <p className="text-sm font-medium">Filter status</p>
          <p className="text-xs text-muted-foreground">This content matches its trigger width.</p>
        </PopoverContent>
      </Popover>
      <WorkspaceSwitcher
        value={workspace}
        options={[...demoWorkspaces]}
        onValueChange={onWorkspaceChange}
        size={size}
        className="w-full"
      />
    </>
  )
}

function StateTile({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function PopoverWidthExample({
  label,
  widthMode,
}: {
  label: string
  widthMode: "match-trigger" | "auto" | "custom"
}) {
  return (
    <Popover>
      <PopoverTrigger controlSize="sm" aria-label={`${label} content example`} className="w-full">
        <span>{label}</span>
        <ChevronDownIcon aria-hidden="true" className={controlIconSizeClasses.sm} />
      </PopoverTrigger>
      <PopoverContent
        widthMode={widthMode}
        align="start"
        className={widthMode === "custom" ? "w-[28rem] p-3" : "p-3"}
      >
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {widthMode === "match-trigger"
            ? "The content follows the trigger width."
            : widthMode === "auto"
              ? "The content uses its natural width."
              : "The content can be wider without stretching the trigger."}
        </p>
      </PopoverContent>
    </Popover>
  )
}
