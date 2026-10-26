"use client"

// Product fonts are only needed for previews, so they load here instead of in globals.css (which feeds parry-theme).
import "@fontsource-variable/dm-sans"
import "@fontsource-variable/ibm-plex-sans"

import { useSyncExternalStore } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import products from "@/lib/products.json"

type ProductKey = keyof typeof products
export type ProductId = "parry" | ProductKey

const STORAGE_KEY = "parry-preview-product"
const CHANGE_EVENT = "parry-preview-product-change"
const isProduct = (v: unknown): v is ProductKey => typeof v === "string" && v in products

// In-memory fallback so switching still works when localStorage is blocked.
let current: ProductId | null = null

function read(): ProductId {
  if (current) return current
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isProduct(stored) ? stored : "parry"
  } catch {
    return "parry"
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

export function useProduct() {
  return useSyncExternalStore(subscribe, read, () => "parry" as ProductId)
}

function setProduct(id: ProductId) {
  current = id
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

// Previews opt in with the `product-scope` class. Overlays portal to <body>, so they are matched by data-slot;
// shell overlays (site menu, this switcher) opt out with `data-shell`.
const overlays = ["dialog-content", "select-content", "dropdown-menu-content", "dropdown-menu-sub-content", "tooltip-content"]
  .map((slot) => `[data-slot="${slot}"]`)
  .concat("[data-sonner-toaster]")
  .join(",")
const scope = `.product-scope,:is(${overlays}):not([data-shell])`

/** Injects the selected product's tokens and font into preview scopes; renders nothing for Parry. */
export function ProductThemeStyle() {
  const product = useProduct()
  if (!isProduct(product)) return null
  const { font, light, dark } = products[product]
  const vars = (Object.keys(light) as (keyof typeof light)[])
    .map((k) => `--${k}:light-dark(${light[k]},${dark[k]})`)
    .join(";")
  const css = `${scope}{${vars};font-family:"${font} Variable",ui-sans-serif,system-ui,sans-serif}:is(${scope}) .font-heading{font-family:inherit}`
  return <style>{css}</style>
}

export function ProductSwitcher({ className }: { className?: string }) {
  const product = useProduct()

  return (
    <Select value={product} onValueChange={(v) => setProduct(v as ProductId)}>
      <SelectTrigger aria-label="Preview product theme" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent data-shell>
        <SelectItem value="parry">
          <span aria-hidden className="size-3 rounded-full bg-[#171C24] ring-1 ring-border" /> Parry · Plus Jakarta Sans
        </SelectItem>
        {(Object.keys(products) as ProductKey[]).map((id) => (
          <SelectItem key={id} value={id}>
            <span aria-hidden className="size-3 rounded-full" style={{ background: products[id].brand }} />
            {products[id].name} · {products[id].font}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Shows the token overrides of the selected product (Themes page). */
export function ProductTokens() {
  const product = useProduct()
  if (!isProduct(product)) return null
  const { name, font, light, dark } = products[product]

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm">
      <p className="font-medium">{name} overrides</p>
      <p className="text-muted-foreground">Font: {font}</p>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5">
        <span className="text-xs text-muted-foreground">Token</span>
        <span className="text-xs text-muted-foreground">Light</span>
        <span className="text-xs text-muted-foreground">Dark</span>
        {(Object.keys(light) as (keyof typeof light)[]).map((k) => (
          <TokenRow key={k} name={k} light={light[k]} dark={dark[k]} />
        ))}
      </div>
    </div>
  )
}

function TokenRow({ name, light, dark }: { name: string; light: string; dark: string }) {
  return (
    <>
      <code className="font-mono text-xs break-all">--{name}</code>
      {[light, dark].map((hex, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="size-3.5 rounded border" style={{ background: hex }} />
          <code className="font-mono text-xs">{hex}</code>
        </span>
      ))}
    </>
  )
}
