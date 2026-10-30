"use client"

import * as React from "react"
import { PauseIcon, PlayIcon } from "lucide-react"

import { cn } from "cn"

// Story-style viewer: segments auto-advance with progress bars; tap the left/right half to step,
// or use the pause button. Auto-advance is off when the viewer prefers reduced motion.
function Reel({
  children,
  duration = 5,
  className,
  "aria-label": ariaLabel = "Stories",
}: {
  children: React.ReactNode
  // Seconds per segment.
  duration?: number
  className?: string
  "aria-label"?: string
}) {
  const segments = React.Children.toArray(children)
  const [index, setIndex] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const elapsed = React.useRef(0)

  React.useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const total = duration * 1000
    const id = setInterval(() => {
      elapsed.current += 50
      if (elapsed.current >= total) {
        elapsed.current = 0
        setIndex((i) => (i + 1) % segments.length)
      }
      setProgress((elapsed.current / total) * 100)
    }, 50)
    return () => clearInterval(id)
  }, [paused, duration, segments.length])

  const go = (next: number) => {
    elapsed.current = 0
    setIndex(Math.min(segments.length - 1, Math.max(0, next)))
    setProgress(0)
  }

  return (
    <section data-slot="reel" aria-roledescription="carousel" aria-label={ariaLabel} className={cn("relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-muted", className)}>
      <div className="absolute inset-0 [&>*]:size-full">{segments[index]}</div>
      <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
        {segments.map((_, i) => (
          <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/40">
            <span className="block h-full bg-white" style={{ width: `${i < index ? 100 : i === index ? progress : 0}%` }} />
          </span>
        ))}
      </div>
      <button type="button" aria-label="Previous" className="absolute inset-y-0 left-0 z-10 w-1/2 outline-none focus-visible:bg-white/10" onClick={() => go(index - 1)} />
      <button type="button" aria-label="Next" className="absolute inset-y-0 right-0 z-10 w-1/2 outline-none focus-visible:bg-white/10" onClick={() => go(index + 1)} />
      <button
        type="button"
        aria-label={paused ? "Play" : "Pause"}
        onClick={() => setPaused(!paused)}
        className="absolute top-4 right-2 z-20 flex size-7 items-center justify-center rounded-full bg-black/40 text-white outline-none focus-visible:ring-2 focus-visible:ring-white [&_svg]:size-3.5"
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>
      <span className="sr-only" aria-live="polite">
        {index + 1} of {segments.length}
      </span>
    </section>
  )
}

export { Reel }
