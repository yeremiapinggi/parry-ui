// WCAG contrast check for the hex tokens in app/globals.css (:root, .dark and the [data-theme] block presets).
// Usage: node scripts/check-contrast.mjs  — exits 1 if any pair is below its minimum.
import { readFileSync } from "node:fs"

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

function tokens(selector) {
  const block = css.match(new RegExp(`^${selector.replace(/[.[\]]/g, "\\$&")} \\{([^}]*)\\}`, "m"))[1]
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
// Composite `fg` at `alpha` over `bg`, as Tailwind's `bg-x/10` does.
const mix = (fg, bg, alpha) =>
  "#" + rgb(fg).map((c, i) => Math.round((c * alpha + rgb(bg)[i] * (1 - alpha)) * 255).toString(16).padStart(2, "0")).join("")

// [foreground, background, minimum ratio]; 4.5 for text, 3 for non-text (borders, rings, icons).
const pairs = (t, dark) => [
  ["foreground", "background", 4.5],
  ["card-foreground", "card", 4.5],
  ["popover-foreground", "popover", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["primary", "background", 4.5],
  ["primary-foreground", "primary-hover", 4.5],
  ["link", "background", 4.5],
  ["link", "card", 4.5],
  // Fields are filled with --card (Parry change to input/textarea/select), so placeholders sit on it
  ["placeholder", "card", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive", "background", 4.5],
  // Button variant="destructive": destructive-foreground on bg-destructive, hover /90 (dark: /60, hover /50)
  ...[t.background, t.card].flatMap((bg) =>
    (dark ? [0.6, 0.5] : [1, 0.9]).map((a) => ["destructive-foreground", mix(t.destructive, bg, a), 4.5])
  ),
  // Destructive dropdown item: text-destructive on bg-destructive/10 over the popover
  ["destructive", mix(t.destructive, t.popover, 0.1), 4.5],
  ["success", "success-soft", 4.5],
  ["warning", "warning-soft", 4.5],
  ["info", "info-soft", 4.5],
  ["destructive", "destructive-soft", 4.5],
  // Field, checkbox and switch edges are drawn with --input; switch track is bg-input (dark: /80).
  // Light --input is shadcn's #E5E5E5 by design decision and knowingly below 3:1, so only dark is checked.
  ...(dark ? [["input", "background", 3], ["input", "card", 3], [mix(t.input, t.card, 0.8), "card", 3]] : []),
  ["ring", "background", 3],
  ["ring", "card", 3],
  ["sidebar-foreground", "sidebar", 4.5],
  ["sidebar-primary-foreground", "sidebar-primary", 4.5],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5],
]

// Product preview themes (lib/products.json) override a subset of tokens on top of Parry's.
const productPairs = [
  ["primary-foreground", "primary", 4.5],
  ["primary-foreground", "primary-hover", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["ring", "card", 3],
]
const products = JSON.parse(readFileSync(new URL("../lib/products.json", import.meta.url), "utf8"))

let failed = 0
function check(label, t, list) {
  for (const [fg, bg, min] of list) {
    const a = t[fg] ?? fg
    const b = t[bg] ?? bg
    if (!a?.startsWith("#") || !b?.startsWith("#")) throw new Error(`${label}: missing hex token ${fg} or ${bg}`)
    const r = ratio(a, b)
    const ok = r >= min
    if (!ok) failed++
    console.log(`${ok ? "ok  " : "FAIL"} ${label.padEnd(15)} ${fg} on ${t[bg] ? bg : `mix ${b}`}: ${r.toFixed(2)} (min ${min})`)
  }
}
for (const [selector, dark] of [[":root", false], [".dark", true]]) {
  const t = tokens(selector)
  check(selector, t, pairs(t, dark))
  for (const [id, p] of Object.entries(products)) {
    check(`${id}${dark ? " dark" : ""}`, { ...t, ...p[dark ? "dark" : "light"] }, productPairs)
  }
}
// Block presets define every token, so they get the full pair list; nightshift also sets .dark.
for (const name of ["classic", "nightshift", "lagoon", "contrast"]) {
  const t = tokens(`[data-theme="${name}"]`)
  check(name, t, pairs(t, name === "nightshift"))
}
process.exit(failed ? 1 : 0)
