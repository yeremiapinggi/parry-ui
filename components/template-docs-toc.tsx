"use client"

import { useEffect, useRef, useState } from "react"

import { DocsToc } from "@/components/docs-nav"

export function TemplateDocsToc({ items }: { items: { id: string; label: string }[] }) {
  const [previewOverlapsToc, setPreviewOverlapsToc] = useState(false)
  const tocRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const preview = document.getElementById("live-preview")
    const toc = tocRef.current
    if (!preview || !toc) return

    const updateOverlap = () => {
      const previewBounds = preview.getBoundingClientRect()
      const tocBounds = toc.getBoundingClientRect()
      const overlaps = previewBounds.top < tocBounds.bottom && previewBounds.bottom > tocBounds.top

      setPreviewOverlapsToc((current) => (current === overlaps ? current : overlaps))
    }

    updateOverlap()
    window.addEventListener("scroll", updateOverlap, { passive: true })
    window.addEventListener("resize", updateOverlap)

    return () => {
      window.removeEventListener("scroll", updateOverlap)
      window.removeEventListener("resize", updateOverlap)
    }
  }, [])

  return (
    <aside
      ref={tocRef}
      aria-hidden={previewOverlapsToc}
      className={`hidden self-start xl:sticky xl:top-24 xl:col-start-2 xl:row-start-1 xl:block ${previewOverlapsToc ? "invisible pointer-events-none" : ""}`}
    >
      <DocsToc items={items} />
    </aside>
  )
}
