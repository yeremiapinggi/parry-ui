import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "cn"

// Responsive grid for feature tiles; tiles span columns/rows on larger screens and stack on phones.
function BentoGrid({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bento-grid" className={cn("grid auto-rows-[minmax(9rem,auto)] grid-cols-1 gap-3 sm:grid-cols-3", className)} {...props} />
}

const bentoTileVariants = cva(
  "group/bento relative flex flex-col justify-end gap-1 overflow-hidden rounded-xl border bg-card p-4 text-card-foreground",
  {
    variants: {
      size: {
        default: "",
        wide: "sm:col-span-2",
        tall: "sm:row-span-2",
        large: "sm:col-span-2 sm:row-span-2",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function BentoTile({
  size,
  title,
  description,
  visual,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof bentoTileVariants> & {
    title?: React.ReactNode
    description?: React.ReactNode
    // Decorative content filling the top of the tile (chart, image, icon art).
    visual?: React.ReactNode
  }) {
  return (
    <div data-slot="bento-tile" className={cn(bentoTileVariants({ size }), className)} {...props}>
      {visual && <div className="mb-auto flex flex-1 items-center justify-center pb-3">{visual}</div>}
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  )
}

export { BentoGrid, BentoTile, bentoTileVariants }
