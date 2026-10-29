import type { ReactNode } from "react"

import { TemplateDocsToc } from "@/components/template-docs-toc"
import { cn } from "@/lib/utils"

type TemplateDocumentationLayoutProps = {
  children: ReactNode
  items: { id: string; label: string }[]
  maxWidth?: "standard" | "wide"
}

export function TemplateDocumentationLayout({
  children,
  items,
  maxWidth = "standard",
}: TemplateDocumentationLayoutProps) {
  return (
    <article
      className={cn(
        "mx-auto grid w-full grid-cols-1 gap-x-10 gap-y-12 px-4 py-10 xl:grid-cols-[minmax(0,1fr)_180px] [&>*]:min-w-0 [&>#live-preview]:min-w-0 xl:[&>*:not(aside):not(#live-preview)]:col-start-1 xl:[&>#live-preview]:col-span-full",
        maxWidth === "wide" ? "max-w-[1600px]" : "max-w-7xl",
      )}
    >
      {children}
      <TemplateDocsToc items={items} />
    </article>
  )
}
