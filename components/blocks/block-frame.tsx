"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CodeIcon, ExternalLinkIcon, MonitorIcon, SmartphoneIcon, TabletIcon, type LucideIcon } from "lucide-react"

import { blockThemes, type BlockThemeId } from "@/components/blocks/_parts/block-themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Snippet } from "@/components/ui/snippet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type BlockFrameMeta = { id: string; title: string; description: string; path: string }

const viewports: { id: string; label: string; width: number; height: number; icon: LucideIcon }[] = [
  { id: "desktop", label: "Desktop", width: 1440, height: 900, icon: MonitorIcon },
  { id: "tablet", label: "Tablet", width: 1024, height: 768, icon: TabletIcon },
  { id: "mobile", label: "Mobile", width: 390, height: 844, icon: SmartphoneIcon },
]

/**
 * Preview of one block in a real iframe at the chosen viewport width, scaled down to fit the card. An iframe (not a
 * scaled div) so the block's media-query breakpoints see that width and its menus portal inside the themed page.
 */
export function BlockFrame({ block, theme, onThemeChange }: { block: BlockFrameMeta; theme: BlockThemeId; onThemeChange: (t: BlockThemeId) => void }) {
  const [viewportId, setViewportId] = useState("desktop")
  const [available, setAvailable] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const viewport = viewports.find((v) => v.id === viewportId)!
  const scale = available ? Math.min(1, available / viewport.width) : 0
  const src = `/blocks/${block.id}?theme=${theme}`

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <h2 className="font-heading font-semibold">{block.title}</h2>
          <p className="text-sm text-muted-foreground">{block.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={theme} onValueChange={(v) => onThemeChange(v as BlockThemeId)}>
            <SelectTrigger size="sm" aria-label={`${block.title} preview theme`} className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blockThemes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={viewportId} onValueChange={(v) => v && setViewportId(v)} aria-label="Preview width">
            {viewports.map((v) => (
              <ToggleGroupItem key={v.id} value={v.id} aria-label={`${v.label} ${v.width}px`} title={`${v.label} · ${v.width}px`}>
                <v.icon />
                <span className="max-sm:sr-only">{v.width}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CodeIcon />
                View code
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)]">
              <PopoverHeader>
                <PopoverTitle>{block.title}</PopoverTitle>
                <PopoverDescription>Entry file and route for this block.</PopoverDescription>
              </PopoverHeader>
              <Snippet
                commands={[
                  { label: "File", code: block.path },
                  { label: "Route", code: `/blocks/${block.id}` },
                ]}
              />
            </PopoverContent>
          </Popover>
          <Button asChild size="sm">
            <Link href={src} target="_blank" rel="noopener">
              Open full page
              <ExternalLinkIcon />
            </Link>
          </Button>
        </div>
      </header>

      <div ref={stage} className="bg-muted p-4">
        {/* Reserve the scaled height; the iframe keeps its real size and is shrunk with a transform. */}
        <div className="mx-auto overflow-hidden rounded-lg border bg-background shadow-sm" style={{ width: viewport.width * scale, height: viewport.height * scale }}>
          {scale > 0 && (
            <iframe
              key={src}
              src={src}
              title={`${block.title} preview, ${viewport.label} ${viewport.width}px, ${theme} theme`}
              loading="lazy"
              className="origin-top-left border-0"
              style={{ width: viewport.width, height: viewport.height, transform: `scale(${scale})` }}
            />
          )}
        </div>
      </div>
    </Card>
  )
}
