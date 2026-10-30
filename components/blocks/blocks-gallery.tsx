"use client"

import { useState } from "react"

import { BlockFrame, type BlockFrameMeta } from "@/components/blocks/block-frame"
import { blockThemes, type BlockThemeId } from "@/components/blocks/_parts/block-themes"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// The gallery theme sets every frame at once; each frame can still switch on its own afterwards.
export function BlocksGallery({ blocks }: { blocks: (BlockFrameMeta & { category: string })[] }) {
  const [themes, setThemes] = useState<Record<string, BlockThemeId>>({})
  const [all, setAll] = useState<BlockThemeId>("classic")
  const categories = [...new Set(blocks.map((b) => b.category))]

  return (
    <Tabs defaultValue={categories[0]} className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          {categories.map((c) => (
            <TabsTrigger key={c} value={c}>
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center gap-2">
          <Label htmlFor="gallery-theme" className="text-sm text-muted-foreground">
            Theme for all
          </Label>
          <Select
            value={all}
            onValueChange={(v) => {
              setAll(v as BlockThemeId)
              setThemes({})
            }}
          >
            <SelectTrigger id="gallery-theme" className="w-36">
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
        </div>
      </div>
      {categories.map((c) => (
        <TabsContent key={c} value={c} className="flex flex-col gap-10">
          {blocks
            .filter((b) => b.category === c)
            .map((b) => (
              <BlockFrame key={b.id} block={b} theme={themes[b.id] ?? all} onThemeChange={(t) => setThemes((x) => ({ ...x, [b.id]: t }))} />
            ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
