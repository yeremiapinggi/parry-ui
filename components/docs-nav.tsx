"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const guides = [
  { href: "/docs", label: "Getting started" },
  { href: "/docs/theming", label: "Theming" },
]

const linkClass =
  "rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"

export function DocsNav({ components }: { components: string[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Dokumentasi" className="flex flex-col gap-6 text-sm">
      <div className="flex flex-col gap-1">
        <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Panduan</p>
        {guides.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={linkClass}>
            {label}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Komponen</p>
        {components.map((name) => (
          <Link key={name} href={`/components#${name}`} className={cn(linkClass, "capitalize")}>
            {name.replace("-", " ")}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function DocsToc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Di halaman ini" className="flex flex-col gap-2 text-sm">
      <p className="font-medium">Di halaman ini</p>
      {items.map(({ id, label }) => (
        <a key={id} href={`#${id}`} className="text-muted-foreground hover:text-foreground">
          {label}
        </a>
      ))}
    </nav>
  )
}

export function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-sidebar text-sidebar-foreground">
      {title && <figcaption className="border-b border-sidebar-border px-4 py-2 font-mono text-xs">{title}</figcaption>}
      <pre className="overflow-x-auto p-4 font-mono text-sm">{children}</pre>
    </figure>
  )
}
