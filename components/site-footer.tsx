import Link from "next/link"

const columns = [
  {
    title: "Get started",
    links: [
      { href: "/docs", label: "Getting started" },
      { href: "/docs/theming", label: "Theming" },
    ],
  },
  {
    title: "Library",
    links: [
      { href: "/components", label: "Components" },
      { href: "/themes", label: "Themes" },
    ],
  },
  {
    title: "Built with",
    links: [
      { href: "https://ui.shadcn.com", label: "shadcn/ui" },
      { href: "https://www.radix-ui.com", label: "Radix" },
      { href: "https://tailwindcss.com", label: "Tailwind CSS" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[2fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-2xl font-extrabold tracking-tighter text-primary">parry</p>
          <p className="max-w-xs text-sm text-muted-foreground">The Ivosights UI Kit, built on shadcn/ui.</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2 text-sm">
            <p className="font-medium">{col.title}</p>
            {col.links.map(({ href, label }) => (
              <Link key={href} href={href} className="text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <p className="mx-auto w-full max-w-7xl px-4 pb-8 text-xs text-muted-foreground">© 2026 Ivosights</p>
    </footer>
  )
}
