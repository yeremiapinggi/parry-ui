"use client"

import { useState, type ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function TemplateShellPreview({
  standalone,
  withAppShell,
}: {
  standalone: ReactNode
  withAppShell: ReactNode
}) {
  const [mode, setMode] = useState<"standalone" | "shell">("standalone")

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-col gap-1">
          <Label className="font-data text-sm font-medium">Preview mode</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">View this template by itself or inside the shared application navigation.</p>
        </div>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => { if (value) setMode(value as "standalone" | "shell") }}
          variant="outline"
          size="sm"
          aria-label="Dashboard preview mode"
        >
          <ToggleGroupItem value="standalone">Standalone</ToggleGroupItem>
          <ToggleGroupItem value="shell">With App Shell</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {mode === "standalone" ? standalone : withAppShell}
    </div>
  )
}
