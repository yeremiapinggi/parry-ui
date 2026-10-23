// WCAG contrast check for the hex tokens in app/globals.css (:root and .dark).
// Usage: node scripts/check-contrast.mjs  — exits 1 if any pair is below its minimum.
import { readFileSync } from "node:fs"

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

function tokens(selector) {
  const block = css.match(new RegExp(`^${selector.replace(".", "\\.")} \\{([^}]*)\\}`, "m"))[1]
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
  ["secondary-foreground", "secondary", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive", "background", 4.5],
  // Button variant="destructive": text-destructive on bg-destructive/10 (dark: /20)
  ["destructive", mix(t.destructive, t.background, dark ? 0.2 : 0.1), 4.5],
  ["destructive", mix(t.destructive, t.card, dark ? 0.2 : 0.1), 4.5],
  ["success", "success-soft", 4.5],
  ["warning", "warning-soft", 4.5],
  ["info", "info-soft", 4.5],
  ["destructive", "destructive-soft", 4.5],
  ["ring", "background", 3],
  ["ring", "card", 3],
  ["sidebar-foreground", "sidebar", 4.5],
  ["sidebar-primary-foreground", "sidebar-primary", 4.5],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5],
]

let failed = 0
for (const [selector, dark] of [[":root", false], [".dark", true]]) {
  const t = tokens(selector)
  for (const [fg, bg, min] of pairs(t, dark)) {
    const a = t[fg] ?? fg
    const b = t[bg] ?? bg
    if (!a?.startsWith("#") || !b?.startsWith("#")) throw new Error(`${selector}: missing hex token ${fg} or ${bg}`)
    const r = ratio(a, b)
    const ok = r >= min
    if (!ok) failed++
    console.log(`${ok ? "ok  " : "FAIL"} ${selector.padEnd(5)} ${fg} on ${t[bg] ? bg : `mix ${b}`}: ${r.toFixed(2)} (min ${min})`)
  }
}
process.exit(failed ? 1 : 0)
