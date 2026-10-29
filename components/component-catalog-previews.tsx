"use client"

import { ChevronDownIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
      <div className="w-56">
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" controlSize="sm" className="w-full">
            Filter status <ChevronDownIcon data-icon="inline-end" />
          </Button>
        </PopoverTrigger>
        <PopoverContent widthMode="match-trigger" align="start" className="p-3">
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
      </div>
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
