import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BlockThemeRoot } from "@/components/blocks/_parts/block-theme-root"
import { blocks } from "@/components/blocks/registry"

export function generateStaticParams() {
  return blocks.map((b) => ({ id: b.meta.id }))
}

export async function generateMetadata({ params }: PageProps<"/blocks/[id]">): Promise<Metadata> {
  const { id } = await params
  const block = blocks.find((b) => b.meta.id === id)
  return { title: block ? `${block.meta.title} · Blocks · Parry UI` : "Blocks · Parry UI" }
}

// Full-screen block; the site header and footer hide themselves on this route.
export default function BlockPage({ params }: PageProps<"/blocks/[id]">) {
  return (
    <>
      <BlockThemeRoot />
      {/* params are URL data: read them under Suspense so navigation between blocks stays instant */}
      <Suspense>
        <Block params={params} />
      </Suspense>
    </>
  )
}

async function Block({ params }: { params: PageProps<"/blocks/[id]">["params"] }) {
  const { id } = await params
  const block = blocks.find((b) => b.meta.id === id)
  if (!block) notFound()
  return <block.Component />
}
