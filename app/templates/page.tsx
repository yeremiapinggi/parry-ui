import type { Metadata } from "next"

import { TemplatesGallery } from "@/components/templates-gallery"

export const metadata: Metadata = {
  title: "Templates · Parry UI",
  description: "Browse reusable page templates for enterprise SaaS applications.",
}

export const instant = false

export default function TemplatesPage() {
  return <TemplatesGallery />
}
