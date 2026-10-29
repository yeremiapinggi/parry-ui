"use client"

import { ChevronDownIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const weeklyRequests = [
  { day: "Mon", requests: 28 },
  { day: "Tue", requests: 42 },
  { day: "Wed", requests: 35 },
  { day: "Thu", requests: 56 },
  { day: "Fri", requests: 48 },
]

const requestsConfig = {
  requests: { label: "Requests", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ChartCatalogPreview() {
  return (
    <ChartContainer
      config={requestsConfig}
      className="h-36 min-h-36 w-full aspect-auto"
      role="img"
      aria-label="Bar chart showing daily requests from Monday to Friday"
    >
      <BarChart data={weeklyRequests} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="requests" fill="var(--color-requests)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function PopoverCatalogPreview() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Filter status <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <PopoverHeader>
          <PopoverTitle>Status</PopoverTitle>
          <PopoverDescription>Choose which records to show.</PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-3 px-1 py-2">
          <div className="flex items-center gap-2">
            <Checkbox id="catalog-status-active" defaultChecked />
            <Label htmlFor="catalog-status-active">Active</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="catalog-status-pending" />
            <Label htmlFor="catalog-status-pending">Pending</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function RadioGroupCatalogPreview() {
  return (
    <RadioGroup defaultValue="comfortable" aria-label="Display density" className="w-full max-w-56">
      <div className="flex items-center gap-2">
        <RadioGroupItem id="catalog-density-compact" value="compact" />
        <Label htmlFor="catalog-density-compact">Compact</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="catalog-density-comfortable" value="comfortable" />
        <Label htmlFor="catalog-density-comfortable">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="catalog-density-spacious" value="spacious" />
        <Label htmlFor="catalog-density-spacious">Spacious</Label>
      </div>
    </RadioGroup>
  )
}

export function ToggleGroupCatalogPreview() {
  return (
    <ToggleGroup type="single" defaultValue="grid" variant="outline" aria-label="Choose a display mode">
      <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
    </ToggleGroup>
  )
}

export function AspectRatioCatalogPreview() {
  return (
    <div className="grid w-full max-w-72 grid-cols-3 items-end gap-3">
      {[
        { label: "16:9", ratio: 16 / 9 },
        { label: "4:3", ratio: 4 / 3 },
        { label: "1:1", ratio: 1 },
      ].map(({ label, ratio }) => (
        <AspectRatio key={label} ratio={ratio} className="flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
          {label}
        </AspectRatio>
      ))}
    </div>
  )
}

const releases = ["v2.4.0", "v2.3.2", "v2.3.1", "v2.3.0", "v2.2.4", "v2.2.3", "v2.2.0", "v2.1.0"]
const channels = ["WhatsApp", "Instagram", "Facebook", "Email", "Live Chat", "Telegram", "X", "TikTok"]

export function ScrollAreaCatalogPreview() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-3">
      <ScrollArea className="h-32 rounded-md border">
        <div className="p-3 text-sm">
          <p className="pb-2 text-xs font-medium text-muted-foreground">Releases</p>
          {releases.map((release, i) => (
            <div key={release}>
              {i > 0 && <Separator className="my-2" />}
              {release}
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="w-full rounded-md border whitespace-nowrap">
        <div className="flex gap-2 p-2">
          {channels.map((channel) => (
            <span key={channel} className="rounded-full bg-muted px-2.5 py-1 text-xs">{channel}</span>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export function ResizableCatalogPreview() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="min-h-36 max-w-72 rounded-md border text-sm">
      <ResizablePanel defaultSize="40" minSize="25">
        <div className="flex h-full items-center justify-center p-3 text-muted-foreground">Sidebar</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="60">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="60">
            <div className="flex h-full items-center justify-center p-3 text-muted-foreground">Editor</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="40">
            <div className="flex h-full items-center justify-center p-3 text-muted-foreground">Terminal</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
