import type { Metadata } from "next"

import { BlocksGallery } from "@/components/blocks/blocks-gallery"
import { blocks } from "@/components/blocks/registry"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Blocks · Parry UI",
  description: "Full-page Sociomile compositions built from Parry UI components, previewable in every theme.",
}

export default function BlocksPage() {
  // Only plain metadata crosses to the client gallery; the blocks themselves load inside the preview iframes.
  const items = blocks.map((b) => ({ ...b.meta, path: b.path }))
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col items-start gap-3">
        <Badge variant="secondary">Sociomile</Badge>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Blocks</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Full pages assembled from Parry UI components and theme tokens. Switch the theme and width to see how each page holds up, or open
          it full screen.
        </p>
      </header>
      <BlocksGallery blocks={items} />
    </div>
  )
}
