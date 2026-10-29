"use client"

import * as React from "react"

import { cn } from "cn"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Click-to-zoom: the image is a button that opens the full-size version in a Dialog (Esc or click outside closes).
// Pass `open` + `onOpenChange` to control it.
function ImageZoom({
  src,
  zoomSrc,
  alt,
  open,
  onOpenChange,
  className,
  zoomClassName,
}: {
  src: string
  // Larger file for the zoomed view; defaults to `src`.
  zoomSrc?: string
  alt: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  zoomClassName?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          data-slot="image-zoom"
          aria-label={`Zoom image: ${alt}`}
          className={cn("cursor-zoom-in overflow-hidden rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- registry component, must work outside Next.js */}
          <img src={src} alt={alt} className="size-full object-cover" />
        </button>
      </DialogTrigger>
      <DialogContent className={cn("w-auto max-w-[calc(100vw-2rem)] p-2 sm:max-w-[min(90vw,64rem)]", zoomClassName)}>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {/* eslint-disable-next-line @next/next/no-img-element -- registry component, must work outside Next.js */}
        <img src={zoomSrc ?? src} alt={alt} className="max-h-[85vh] w-auto rounded-md object-contain" />
      </DialogContent>
    </Dialog>
  )
}

export { ImageZoom }
