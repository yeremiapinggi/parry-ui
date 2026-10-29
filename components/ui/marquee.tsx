"use client"

import * as React from "react"

import { cn } from "cn"

// Endless horizontal scroll of its children. Driven by the Web Animations API, so consumers need no
// @keyframes in their CSS; it stays still when the viewer prefers reduced motion. Inline-size containment
// keeps the doubled track from widening the parent layout.
function Marquee({
  duration = 30,
  reverse = false,
  pauseOnHover = true,
  fade = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  // Seconds for one full loop; lower is faster.
  duration?: number
  reverse?: boolean
  pauseOnHover?: boolean
  fade?: boolean
}) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const animationRef = React.useRef<Animation | null>(null)

  React.useEffect(() => {
    const track = trackRef.current
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const frames = [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }]
    const animation = track.animate(reverse ? frames.reverse() : frames, { duration: duration * 1000, iterations: Infinity })
    animationRef.current = animation
    return () => animation.cancel()
  }, [duration, reverse])

  return (
    <div
      data-slot="marquee"
      className={cn("w-full overflow-hidden [contain:inline-size]", fade && "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]", className)}
      onMouseEnter={pauseOnHover ? () => animationRef.current?.pause() : undefined}
      onMouseLeave={pauseOnHover ? () => animationRef.current?.play() : undefined}
      {...props}
    >
      <div ref={trackRef} className="flex w-max">
        <div className="flex shrink-0 items-center gap-6 pr-6">{children}</div>
        {/* Second copy makes the loop seamless; hidden from assistive tech so content is read once. */}
        <div aria-hidden className="flex shrink-0 items-center gap-6 pr-6">{children}</div>
      </div>
    </div>
  )
}

export { Marquee }
