import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, ArrowUpDownIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Templates · Parry UI",
  description: "Browse reusable enterprise interface templates built with Parry UI components.",
}

const rows = [
  { name: "Alya Pratama", company: "Northstar Labs", status: "Active" },
  { name: "Mei Tan", company: "Meridian Works", status: "Invited" },
  { name: "Dimas Saputra", company: "Horizon Group", status: "Active" },
]

function TemplateThumbnail() {
  return (
    <div aria-hidden="true" className="product-scope overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b p-3">
        <div className="flex flex-col gap-1"><span className="h-2.5 w-24 rounded-sm bg-foreground/80" /><span className="h-2 w-32 rounded-sm bg-muted-foreground/30" /></div>
        <span className="h-7 w-20 rounded-md bg-primary" />
      </div>
      <div className="flex items-center gap-2 border-b p-3">
        <span className="flex h-7 min-w-32 items-center gap-2 rounded-md border px-2"><SearchIcon className="size-3 text-muted-foreground" /><span className="h-1.5 w-16 rounded-sm bg-muted-foreground/30" /></span>
        <span className="h-7 w-20 rounded-md border" />
        <span className="ml-auto flex size-7 items-center justify-center rounded-md border"><ArrowUpDownIcon className="size-3 text-muted-foreground" /></span>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-[1.1fr_1fr_0.6fr] gap-2 border-b px-2 py-2 text-[9px] font-medium text-muted-foreground"><span>Name</span><span>Company</span><span>Status</span></div>
        {rows.map((row) => (
          <div key={row.name} className="grid grid-cols-[1.1fr_1fr_0.6fr] items-center gap-2 border-b last:border-0 px-2 py-2.5 text-[9px]">
            <span className="truncate font-medium">{row.name}</span>
            <span className="truncate text-muted-foreground">{row.company}</span>
            <span className={row.status === "Active" ? "w-fit rounded-full bg-success-soft px-1.5 py-0.5 text-success" : "w-fit rounded-full bg-info-soft px-1.5 py-0.5 text-info"}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">Parry UI / Library</p>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Templates</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">Reusable page patterns composed from Parry UI components. Start with a proven structure, then adapt it to your product.</p>
      </header>

      <section aria-labelledby="tables-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 id="tables-heading" className="font-heading text-xl font-semibold">Tables &amp; Data Management</h2>
            <p className="text-sm text-muted-foreground">Browse and maintain structured business records.</p>
          </div>
          <Badge variant="secondary">1 template</Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
            <Link href="/templates/data-management-list" className="group flex h-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <div className="bg-muted p-4 sm:p-5"><TemplateThumbnail /></div>
              <CardHeader className="gap-2 px-5 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Data Management List</CardTitle>
                  <Badge variant="outline">Page template</Badge>
                </div>
                <CardDescription className="leading-relaxed">A configurable table experience for searching, filtering, selecting, and maintaining business records.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between px-5 pb-5 pt-3">
                <span className="text-xs text-muted-foreground">Tables &amp; Data Management</span>
                <span aria-hidden="true" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>
    </main>
  )
}
