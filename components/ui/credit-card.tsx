import * as React from "react"

import { cn } from "cn"

type CardBrand = "visa" | "mastercard" | "generic"

function BrandMark({ brand }: { brand: CardBrand }) {
  if (brand === "mastercard")
    return (
      <svg viewBox="0 0 38 24" aria-hidden className="h-6">
        <circle cx="13" cy="12" r="10" fill="#EB001B" />
        <circle cx="25" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
    )
  if (brand === "visa") return <span className="text-lg font-black tracking-tight italic">VISA</span>
  return null
}

// Display-only card face (not an input). Only the last four digits are shown or announced.
function CreditCard({
  last4,
  name,
  expiry,
  brand = "generic",
  cvc,
  flipped = false,
  className,
}: {
  last4: string
  name: string
  // "MM/YY"
  expiry: string
  brand?: CardBrand
  // Shown on the back when flipped; pass a masked value unless the viewer is the cardholder.
  cvc?: string
  flipped?: boolean
  className?: string
}) {
  const face = "absolute inset-0 flex flex-col rounded-xl p-5 text-white [backface-visibility:hidden] bg-linear-to-br from-[#171C24] via-[#232A35] to-[#3366E0]"

  return (
    <div
      data-slot="credit-card"
      role="img"
      aria-label={`${brand === "generic" ? "Card" : brand === "visa" ? "Visa card" : "Mastercard"} ending in ${last4}, ${name}, expires ${expiry}`}
      className={cn("aspect-[1.586] w-72 [perspective:1000px]", className)}
    >
      <div
        className="relative size-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        <div aria-hidden className={face}>
          <div className="flex items-start justify-between">
            <span className="h-7 w-10 rounded-md bg-linear-to-br from-amber-200 to-amber-400" />
            <BrandMark brand={brand} />
          </div>
          <p className="mt-auto font-mono text-base tracking-wider whitespace-nowrap">•••• •••• •••• {last4}</p>
          <div className="mt-3 flex items-end justify-between text-xs">
            <span className="truncate uppercase">{name}</span>
            <span className="tabular-nums">{expiry}</span>
          </div>
        </div>
        <div aria-hidden className={cn(face, "px-0 [transform:rotateY(180deg)]")}>
          <span className="mt-2 h-10 w-full bg-black/80" />
          <div className="mx-5 mt-4 flex items-center justify-end rounded bg-white/90 px-3 py-1.5 font-mono text-sm text-black">{cvc ?? "•••"}</div>
        </div>
      </div>
    </div>
  )
}

export { CreditCard, type CardBrand }
