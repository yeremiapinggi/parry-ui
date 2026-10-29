"use client"

import * as React from "react"

import { cn } from "cn"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

// Link preview on hover. Pass the page's title, description and image yourself; nothing is fetched.
const Glimpse = HoverCard
const GlimpseTrigger = HoverCardTrigger

function GlimpseContent({ className, ...props }: React.ComponentProps<typeof HoverCardContent>) {
  return <HoverCardContent data-slot="glimpse-content" className={cn("flex w-80 flex-col gap-2", className)} {...props} />
}

function GlimpseImage({ className, alt = "", ...props }: React.ComponentProps<"img">) {
  // eslint-disable-next-line @next/next/no-img-element -- registry component, must work outside Next.js
  return <img data-slot="glimpse-image" alt={alt} className={cn("aspect-[1.91/1] w-full rounded-md border object-cover", className)} {...props} />
}

function GlimpseTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="glimpse-title" className={cn("truncate text-sm font-semibold", className)} {...props} />
}

function GlimpseDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="glimpse-description" className={cn("line-clamp-2 text-sm text-muted-foreground", className)} {...props} />
}

export { Glimpse, GlimpseContent, GlimpseDescription, GlimpseImage, GlimpseTitle, GlimpseTrigger }
