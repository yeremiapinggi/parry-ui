"use client"

import * as React from "react"

import { cn } from "cn"
import { CopyButton } from "@/components/ui/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SnippetCommand = { label: string; code: string }

// One-line commands (e.g. per package manager) in tabs, each with a copy button.
function Snippet({
  commands,
  defaultValue,
  value,
  onValueChange,
  className,
}: {
  commands: SnippetCommand[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  return (
    <Tabs
      data-slot="snippet"
      defaultValue={defaultValue ?? commands[0]?.label}
      value={value}
      onValueChange={onValueChange}
      className={cn("gap-0 overflow-hidden rounded-lg border bg-muted/40", className)}
    >
      {commands.length > 1 && (
        <TabsList variant="line" className="h-9 w-full justify-start rounded-none border-b px-2">
          {commands.map((command) => (
            <TabsTrigger key={command.label} value={command.label} className="flex-none text-xs">
              {command.label}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      {commands.map((command) => (
        <TabsContent key={command.label} value={command.label} className="flex items-center gap-2 py-1.5 pr-1.5 pl-3">
          <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap">
            <span aria-hidden className="mr-2 text-muted-foreground select-none">$</span>
            {command.code}
          </code>
          <CopyButton value={command.code} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export { Snippet, type SnippetCommand }
