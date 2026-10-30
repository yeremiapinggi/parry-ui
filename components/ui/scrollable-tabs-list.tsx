"use client"

import * as React from "react"

import { cn } from "cn"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TabsList } from "@/components/ui/tabs"

// TabsList that scrolls sideways instead of wrapping or squeezing when there are many tabs.
function ScrollableTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  return (
    <ScrollArea data-slot="scrollable-tabs-list" className="w-full pb-2.5 whitespace-nowrap">
      <TabsList className={cn("w-max", className)} {...props} />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export { ScrollableTabsList }
