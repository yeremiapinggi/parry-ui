"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"

// A pile of cards: the top one is active and the next two peek out behind it.
// Prev/next buttons and the arrow keys move through the pile.
function Deck({
  children,
  index: indexProp,
  onIndexChange,
  loop = false,
  className,
  "aria-label": ariaLabel = "Cards",
}: {
  children: React.ReactNode
  index?: number
  onIndexChange?: (index: number) => void
  loop?: boolean
  className?: string
  "aria-label"?: string
}) {
  const cards = React.Children.toArray(children)
  const [indexState, setIndexState] = React.useState(0)
  const index = indexProp ?? indexState
  const go = (next: number) => {
    const clamped = loop ? (next + cards.length) % cards.length : Math.min(cards.length - 1, Math.max(0, next))
    setIndexState(clamped)
    onIndexChange?.(clamped)
  }

  return (
    <section
      data-slot="deck"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn("flex flex-col items-center gap-4", className)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1)
        if (e.key === "ArrowRight") go(index + 1)
      }}
    >
      <div className="relative grid w-full place-items-center">
        {cards.map((card, i) => {
          const offset = i - index
          if (offset < 0 || offset > 2) return null
          return (
            <div
              key={i}
              aria-hidden={offset !== 0}
              inert={offset !== 0}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${cards.length}`}
              className="col-start-1 row-start-1 w-full transition-all duration-300 motion-reduce:transition-none"
              style={{ zIndex: 3 - offset, transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.05})`, opacity: 1 - offset * 0.25 }}
            >
              {card}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 pt-4 text-sm text-muted-foreground">
        <Button variant="outline" size="icon-sm" aria-label="Previous card" disabled={!loop && index === 0} onClick={() => go(index - 1)}>
          <ChevronLeftIcon />
        </Button>
        <span className="tabular-nums" aria-live="polite">
          {index + 1} / {cards.length}
        </span>
        <Button variant="outline" size="icon-sm" aria-label="Next card" disabled={!loop && index === cards.length - 1} onClick={() => go(index + 1)}>
          <ChevronRightIcon />
        </Button>
      </div>
    </section>
  )
}

export { Deck }
